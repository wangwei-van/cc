<template>
  <div class="form-page">
    <Breadcrumb class="custom-breadcrumb">
        <BreadcrumbItem>应用</BreadcrumbItem>
        <BreadcrumbItem :to="listPath">应用管理</BreadcrumbItem>
        <BreadcrumbItem>应用详情</BreadcrumbItem>
    </Breadcrumb>
    <InfoCard :info="info"
              :app-resource="appResource"
              :app-address="appAddress"
              style="margin-bottom: 10px;"
              @open-terminal="openTerminal"
              @hpa="handleHpa"
              @restart="handleRestart"
              @rolling-update="handleRollingUpdate"
              :pod-list="podList">
    </InfoCard>

    <Tabs type="card" class="custom-tabs" v-model="activeTab" :animated="false">
      <TabPane label="实例" name="instance">
        <div style="text-align: right; margin-bottom: 5px;">
          <Button type="info" icon="loop" @click="loadPodList">刷新</Button>
        </div>
        <PodList  :cluster="cluster"
                  :namespace="namespace"
                  :loading="podListLoading"
                  :pod-list="podTableData"
                  @open-terminal="openTerminal">
        </PodList>
      </TabPane>

      <TabPane label="配置信息" name="config" class="info-tab-pane">
        <DeploymentEditableConfig :cluster="cluster"
                                  :namespace="namespace"
                                  :deployment-info="info"
                                  :services="services"
                                  :volumes="volumes"
                                  :configs="configs"
                                  :ingress-rules="ingressRules"
                                  v-if="info && configLoaded && activeTab === 'config'">
        </DeploymentEditableConfig>
        <Spin size="small" fix v-if="!info || !configLoaded"></Spin>
      </TabPane>

      <TabPane label="自动伸缩" name="hpa" class="info-tab-pane">
        <AutoStretch :cluster="cluster"
                     :namespace="namespace"
                     :deployment-name="deploymentName"
                     v-if="activeTab === 'hpa'">
        </AutoStretch>
      </TabPane>

      <TabPane label="监控" name="monitor" class="info-tab-pane">
        <PodMonitor :cluster="cluster"
                    :namespace="namespace"
                    :app-name="deploymentName"
                    :pod-list="podList"
                    :width="formWidth"
                    v-if="activeTab === 'monitor'">
        </PodMonitor>
      </TabPane>

      <TabPane label="日志" name="log" class="info-tab-pane">
        <PodLog :cluster="cluster"
                :namespace="namespace"
                :pod-list="podList"
                v-if="!podListLoading && activeTab === 'log'">
        </PodLog>
        <Spin size="small" fix v-if="podListLoading"></Spin>
      </TabPane>

      <TabPane :label="eventLabel" name="event" class="info-tab-pane">
        <EventList :cluster="cluster"
                  :namespace="namespace"
                  :pod-list="podList"
                  :deployment="deploymentName"
                 @change-count="handleChangeCount"
                  v-if="!podListLoading && activeTab === 'event'">
        </EventList>
        <Spin size="small" fix v-if="podListLoading"></Spin>
      </TabPane>

      <!--<TabPane label="拓扑图" class="info-tab-pane">-->

      <!--</TabPane>-->

    </Tabs>

    <PodTerminal :visible.sync="terminalVisible"
                 :pod="terminalPodName"
                 :namespace="namespace"
                 :cluster="cluster"
                 :container="terminalPodContainer">
    </PodTerminal>

  </div>

</template>

<script>
  import axios from 'axios'
  import _ from 'lodash'
  import dayjs from 'dayjs'
  import InfoCard from './InfoCard'
  import PodList from './PodList'
  import PodMonitor from './PodMonitor'
  import PodLog from './PodLog'
  import AutoStretch from './AutoStretch'
  import EventList from './EventList'
  import DeploymentEditableConfig from '../create/DeploymentEditableConfig'
  import PodTerminal from './PodTerminal'

  export default {
    name: 'deployment-info-page',
    components: { InfoCard, PodList, PodMonitor, PodLog, AutoStretch, EventList, DeploymentEditableConfig, PodTerminal },
    props: {
      cluster: String,
      namespace: String,
      deploymentName: String
    },
    data () {
      return {
        activeTab: 'instance',
        warningCount: 0,
        eventLabel: (h) => {
          return h('div', [
            h('span', '事件'),
            h('Badge', {
              props: {
                count: this.warningCount
              }
            })
          ])
        },
        interval: null,
        updateTime: 5000,
        info: null,
        appResource: {},
        services: [],
        ingressRules: [],
        podStatusCount: {},
        podList: [],
        podTableData: [],
        podListLoading: true,
        terminalPodName: '',
        terminalPodContainer: '',
        terminalVisible: false,
        formWidth: null,
        endpoints: [],
        appAddress: {},
        configLoaded: false,
        configs: [],
        volumes: []
      }
    },
    methods: {
      loadData () {
        this.$api.cluster(this.cluster).getDeploymentInfo(this.namespace, this.deploymentName)
          .then(res => {
            this.info = res.data
            this.getAppResource()
            this.loadPodList()
            this.getIngressList()
            this.getAppService()
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取应用信息失败')
          })
        // this.getEndpoints()
      },
      getAppWarningCount () {
        const fieldSelector = {
          type: 'Warning'
        }
        this.$api.cluster(this.cluster).listPodEvents(this.namespace, fieldSelector)
          .then(res => {
            const data = res.data.items.filter(
              item => _.get(item, 'involvedObject.name', '').startsWith(this.deploymentName + '-') &&
                 _.get(item, 'metadata.annotations.handled') !== 'true'
            )
            this.warningCount = data.length
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取事件列表失败')
          })
      },
      getAppResource () {
        this.$api.metrics.getAppResource(this.cluster, this.namespace, this.deploymentName).then(res => {
          this.appResource = res.data || {}
        })
      },
      getIngressList () {
        const ingressStr = _.get(this.info, 'metadata.annotations["ingress.jd.com"]')
        if (ingressStr) {
          const ingressNames = ingressStr.split('/')
          this.$api.cluster(this.cluster).getIngressesInfo(this.namespace, ingressNames)
            .then(responses => {
              const res = []
              _.forEach(responses, item => {
                res.push({
                  controller: _.get(item.data, 'metadata.annotations["kubernetes.io/ingress.class"]'),
                  host: _.get(item.data, 'spec.rules.0.host'),
                  port: _.get(item.data, 'spec.rules.0.http.paths.0.backend.servicePort'),
                  url: _.get(item.data, 'spec.rules.0.http.paths.0.path'),
                  rewrite: _.get(item.data, 'metadata.annotations["nginx.ingress.kubernetes.io/rewrite-target"]')
                })
              })
              this.ingressRules = res
            })
        }
      },
      getAppService () {
        this.$api.cluster(this.cluster).listServices(this.namespace)
          .then(res => {
            let arr = [], appLabels = _.get(this.info, 'metadata.labels')
            _.forEach(res.data.items, service => {
              let selector = service.spec.selector
              let flag = true
              for (let key in selector) {
                if (!appLabels || !appLabels[key] || selector[key] !== appLabels[key]) {
                  flag = false
                  break
                }
              }
              if (_.isEmpty(selector)) {
                flag = false
              }
              flag && arr.push(service)
            });
            this.services = arr
            this.getAppAddress()
          })
      },
      getAppAddress () {
        const internalAddr = []
        _.forEach(this.services, item => {
          _.forEach(item.spec.ports, port => {
            internalAddr.push(`${item.metadata.name}.${this.namespace}:${port.port}`)
          })
        })

        const ingressAddr = _.get(this.info, 'metadata.annotations["ingressAddr.jd.com"]')
        const externalAddr = ingressAddr ? ingressAddr.split('/').map(item => item) : []
        this.appAddress = {
          internalAddr,
          externalAddr
        }
      },
      getEndpoints () {
        this.$api.metrics.getAppEndpoints(this.cluster, this.namespace, this.deploymentName)
          .then(res => {
            this.endpoints = res.data.filter(url => _.startsWith(url, 'http://') || _.startsWith(url, 'https://')).sort()
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取访问地址失败')
          })
      },
      loadPodList () {
        this.$api.cluster(this.cluster).listPods(this.namespace, this.info)
          .then(res => {
            this.podList = res.data.items

            const initTableData =  _.clone(this.podTableData)
            this.podTableData = this.podList.map(item => {
              let phase = item.status.phase
              if (phase === 'Running') {
                const waitingState = _.get(item, 'status.containerStatuses.0.state.waiting')
                const terminatedState = _.get(item, 'status.containerStatuses.0.state.terminated')
                if (waitingState) {
                  phase = waitingState.reason
                } else if (terminatedState) {
                  phase = terminatedState.reason
                }
              }

              const initData = _.partition(initTableData, {name: item.metadata.name})[0][0]
              return {
                name: item.metadata.name,
                status: phase,
                hostIP: item.status.hostIP,
                createTime: dayjs(item.metadata.creationTimestamp).format('YYYY/MM/DD HH:mm:ss'),
                cpuUsage: initData ? initData.cpuUsage : 0,
                memUsage: initData ? initData.memUsage : 0
              }
            })
            this.podListLoading = false

            this.$api.metrics.listPodResource(this.cluster, this.namespace, this.deploymentName)
              .then(response => {
                this.podTableData.map(item => {
                  let metrics = _.partition(response.data, {name: item.name})[0][0]
                   if (metrics) {
                    _.merge(item, {
                      cpuUsage: `${(metrics.cpu_utili > 0 && metrics.cpu_utili < 0.01) ? '小于1' : (metrics.cpu_utili * 100).toFixed(0)}%
                            (${metrics.cpu_usage} / ${metrics.cpu_request})`,
                      memUsage: `${(metrics.mem_utili > 0 && metrics.mem_utili < 0.01) ? '小于1' : (metrics.mem_utili * 100).toFixed(0)}%
                            (${(metrics.mem_usage/1024/1024).toFixed(0)}M /
                            ${(metrics.mem_request/1024/1024).toFixed(0)}M)`
                    })
                  }
                })
              })
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取实例列表失败')
          })
          .then(() => {
            this.podListLoading = false
          })
      },
      loadConfigs() {
        Promise.all([
          this.$api.cluster(this.cluster).listConfigs('configmap', this.namespace),
          this.$api.cluster(this.cluster).listConfigs('secret', this.namespace)
        ])
          .then(res => {
            const configmaps = res[0].data.items.map(item => _.merge(item, {id: `${item.metadata.name}-configmap`}))
            const secrets = res[1].data.items.map(item => _.merge(item, {id: `${item.metadata.name}-secret`}))
            this.configs = _.concat([], configmaps, secrets)
          })
          .catch(err => {
            this.$NoticeAjaxError(err, "获取config文件列表失败");
          }).then(() => {
            this.configLoaded = true
          });
      },
      loadVolumes () {
        this.$api.cluster(this.cluster).listVolumes(this.namespace)
          .then(res => {
            this.volumes = res.data.items
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取存储卷列表失败')
          })
      },
      openTerminal (name) {
        this.terminalPodName = name
        const pod = _(this.podList).filter(thisPod => thisPod.metadata.name === name).first()
        // todo: deal container is ''
        this.terminalPodContainer = _.get(pod, 'spec.containers.0.name', '')
        this.terminalVisible = true
      },
      handleHpa (hpaNumber) {
        this.$api.cluster(this.cluster).hpaDeployment(this.namespace, this.deploymentName, hpaNumber)
          .then(res => {
            this.loadData()
            this.$Message.success('水平扩展成功')
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '水平扩展失败')
          })
      },
      handleRestart () {
        this.$api.cluster(this.cluster).restartDeployment(this.namespace, this.info)
          .then(res => {
            this.$Message.success('重启应用成功')
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '重启应用失败')
          })
          .then(() => {
            // 1s 后刷新pod列表
            setTimeout(() => {
              this.loadPodList()
            }, 1000)
          })
      },
      handleRollingUpdate (formData) {
        // todo: add loading status
        this.$api.cluster(this.cluster).rollingUpdateDeployment(this.namespace, this.deploymentName, formData)
          .then(res => {
            this.$Message.success('滚动升级成功')
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '滚动升级失败')
          })
          .then(() => {
            this.loadData()
          })
      },
      handleChangeCount (count) {
        this.warningCount = count
      }
    },
    created () {
      this.loadData()
      this.loadConfigs()
      this.loadVolumes()
      this.interval = window.setInterval(this.loadData, this.updateTime)
    },
    beforeDestroy () {
      window.clearInterval(this.interval)
    },
    computed: {
      listPath () {
        return {
          name: 'deploy-deployment-list',
          params: this.$route.params
        }
      },
    },
    watch: {
      $route () {
        this.$router.push({name: 'deploy-deployment-list', params: this.$route.params})
      },
      warningCount (newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal)) {
          this.eventLabel = (h) => {
            return h('div', [
              h('span', '事件'),
              h('Badge', {
                props: {
                  count: newVal
                }
              })
            ])
          }
        }
      }
    },
    mounted () {
      this.formWidth = document.querySelectorAll('.form-page')[0].offsetWidth
      this.getAppWarningCount()
    }
  }
</script>

<style lang="less" scoped>
  @import '../../../style/variable';

  .form-page {
    background: @background-color-base;
    position: absolute;
    top: 20px;
    width: 100%;
    padding-right: 40px;
    min-height: 100%;
    z-index: 10;
    /deep/ .ivu-tabs-tab .ivu-badge-count {
      top: -7px;
    }
  }

</style>

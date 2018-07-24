<template>
  <div>
    <Breadcrumb class="custom-breadcrumb">
        <BreadcrumbItem>应用</BreadcrumbItem>
        <BreadcrumbItem>应用管理</BreadcrumbItem>
    </Breadcrumb>

    <div class="page-content-box">
      <div class="table-toolbar">
        <Button type="success" icon="plus" @click="onClickCreate">创建应用</Button>

        <Button type="default"
                icon="refresh"
                :disabled="selectedRows.length === 0"
                @click="() => restartDeployments(selectedRows)"
                style="margin-left: 10px;">重启</Button>
        <Button type="default"
                icon="trash-b"
                @click="() => deleteDeployments(selectedRows)"
                :disabled="selectedRows.length === 0"
                style="margin-left: 10px;">删除</Button>
        <Button type="info"
                icon="refresh"
                @click="loadData"
                style="float: right; margin-left: 10px;">
          刷新
        </Button>
        <i-input v-model="searchText"
                 placeholder="请输入搜索的应用名称"
                 icon="search"
                 style="width: 200px; float: right;">
        </i-input>
      </div>
      <DataTable :columns="cols"
                 :data="deploymentList"
                 :searchText="searchText"
                 :loading="loading"
                 size="small"
                 stripe
                 @on-selection-change="onSelectionChange">
      </DataTable>

    </div>

  </div>

</template>

<script>
  import _ from 'lodash'
  import {COLORS} from '@/pars'
  import sparkline from './sparkLine'

  const StatusList = ['运行中', '已停止', '操作中']

  export default {
    name: "DeploymentList",
    props: {
      cluster: String,
      namespace: String
    },
    components: {sparkline},
    data () {
      const queryStatus = this.$route.query.status
      const statusCol = {
        title: '应用状态',
        key: 't_status',
        width: 100,
        filters: StatusList.map(item => ({label: item, value: item})),
        render: (h, params) => {
          const iconColor = params.row.t_status === '运行中' ? COLORS.success : COLORS.error
          return[
            h('Icon', {props: {type: 'android-radio-button-on', color: iconColor}}),
            h('span', {style: {marginLeft: '5px'}}, params.row.t_status)
          ]
        }
      }
      if (queryStatus) {
        statusCol.filteredValue = [queryStatus]
      }

      return {
        interval: null,
        updateTime: 15000,
        searchText: '',
        cols: [
          {type: 'selection', width: 60, align: 'center'},
          // {title: '序号', width: 60, key: 't_no'},
          {
            title: '应用名称',
            key: 't_name',
            searchable: true,
            sortable: true,
            render: (h, params) => {
              return h(
                'a',
                {on: {
                  click: () => {
                    const routeParams = {
                      ...this.$route.params,
                      deploymentName: params.row.t_name
                    }
                    this.$router.push({name: 'deploy-deployment-info', params: routeParams})
                  }
                }},
                params.row.t_name
              )
            }
          },
          {
            title: 'CPU 使用率',
            width: 150,
            key: 't_cpu',
            sortable: true,
            render: (h, params) => {
              return h('span', {}, params.row.t_cpu)
              // return h(
              //   'div', {},
              //   [
              //     h(sparkline, {
              //       props: { data: params.row.t_cpu_history },
              //       attrs: {
              //         style: 'height: 15px;margin-right: 5px'
              //       }
              //     }),
              //     h('span', {}, params.row.t_cpu)
              //   ]
              // )
            }
          },
          {
            title: '內存使用率',
            width: 160,
            key: 't_memory',
            sortable: true,
            render: (h, params) => {
              return h('span', {}, params.row.t_memory)
              // return h(
              //   'div', {},
              //   [
              //     h(sparkline, {
              //       props: {
              //         data: params.row.t_memory_history,
              //         options: {
              //           strokeColor: 'rgba(45, 183, 245, 1)',
              //           fillColor: 'rgba(45, 183, 245, 0.2)'
              //         }
              //       },
              //       attrs: {
              //         style: 'height: 15px;margin-right: 5px'
              //       }
              //     }),
              //     h('span', {}, params.row.t_memory)
              //   ]
              // )
            }
          },
          {
            title: '访问地址',
            key: 't_url',
            render: (h, params) => {
              const internalAddr = params.row.address.internalAddr
              const externalAddr = params.row.address.externalAddr
              const renderAddr = (h, addr) => {
                return _.map(addr, item => 
                  h('div', {style: {paddingLeft: '10px'}}, [
                    h('a', {
                      attrs: {
                        href: `http://${item}`, target: '_blank'
                      }
                    }, item),
                    h('Tooltip', {
                      props: {
                        content: '复制', placement: 'right'
                      } 
                    },[
                      h('Icon', {
                        style: {marginLeft: '8px', cursor: 'pointer'},
                        props: {type: 'ios-copy-outline'},
                        directives: [{
                          name: 'clipboard',
                          value: item
                        }]
                      })
                    ])
                  ])
                )
              }
              if (internalAddr.length === 0) {
                return h('span', '--')
              } else {
                const inRender = _.concat(h('div', '内部访问：'), renderAddr(h, internalAddr))
                const exRender = externalAddr.length > 0 ? _.concat(h('div', '外部访问：'), renderAddr(h, externalAddr)) : []
                return h('div', [
                  h('a', {
                    attrs: {
                      href: `http://${internalAddr[0]}`, target: '_blank'
                    }
                  }, internalAddr[0]),
                  internalAddr.length + externalAddr.length > 1 ?
                    h('Tooltip', {
                      props: {
                        placement: 'right', trigger: 'hover'
                      }
                    }, [
                      h('Icon', {
                        props: {type: 'android-more-vertical'},
                        style: {
                          verticalAlign: 'middle', marginLeft: '8px'
                        }
                      }),
                      h('div', {
                        slot: 'content'
                      }, _.concat(inRender, exRender))
                    ]) : ''
                ])
              }
            }
          },
          {
            title: '实例数量',
            key: 't_replicas',
            width: 140,
            render: (h, params) => {
              const n = params.row.t_replicas
              const percent = n[1] > 0 ? n[0] / n[1] * 100 : 100
              return h(
                'Progress',
                {
                  props: {
                    percent: percent,
                    strokeWidth: 5
                  }
                },
                [h('span', {style: {color: '#727682'}}, `${n[0]} / ${n[1]}`)]
              )
            }
          },
          // {
          //   title: '调度策略',
          //   key: 't_strategy'
          // },
          statusCol,
          {
            title: '操作',
            key: 't_name',
            width: 100,
            render: (h, params) => {
              return [
                // h(
                //   'Icon',
                //   {
                //     props: {type: 'compose'},
                //     class: {'table-tool-icon': true},
                //     nativeOn: {
                //       click: () => this.modifyDeployment(params.row)
                //     }
                //   }
                // ),
                h(
                  'Icon',
                  {
                    props: {type: 'trash-b'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => this.deleteDeployments([params.row])
                    }
                  }),
                h(
                  'Icon',
                  {
                    props: {type: 'refresh'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => this.restartDeployments([params.row])
                    }
                  })
              ]
            }
          }
        ],
        deploymentList: [],
        serviceList: [],
        hpaList: [],
        selectedRows: [],
        loading: true,
        endpoints: {}
      }
    },
    methods: {
      loadData () {
        this.getHpas()
        // this.getEndpoints()
        this.getServices().then(res => {
          return this.$api.cluster(this.cluster).listDeployments(this.namespace)
            .then(res => {
              const initDeploymentList = _.clone(this.deploymentList)
              this.deploymentList = res.data.items.map(item => {
                item.t_name = item.metadata.name
                item.t_service = item.metadata.service
                item.t_replicas = [item.status.availableReplicas || 0, item.spec.replicas]
                item.t_status = (item.status.availableReplicas && item.spec.replicas === item.status.availableReplicas) ? '运行中' : '处理中'

                const initResources = _.partition(initDeploymentList, {t_name: item.metadata.name})[0][0]
                item.t_cpu = initResources ? initResources.t_cpu : '0% (0 / 0)'
                item.t_cpu_history = initResources ? initResources.t_cpu_history : [0]
                item.t_memory = initResources ? initResources.t_memory : '0% (0Mb / 0Mb)'
                item.t_memory_history = initResources ? initResources.t_memory_history : [0]
                // this.getAppResourceHistory(item)
                this.getAppAddress(item)
                return item
              })
              this.getAppResource()
            })
            .catch(err => {
              this.$NoticeAjaxError(err, '获取应用列表失败')
            })
            .then(() => {
              this.loading = false
            })
        })
      },
      getAppResourceHistory (app) {
        this.$api.metrics.listAppHistory(this.cluster, this.namespace, app.t_name)
          .then(res => {
            let cpu = [], mem = []
            res.data.map(item => {
              cpu.push(item.cpu_utili * 100)
              mem.push(item.mem_utili * 100)
            })
            app.t_cpu_history = cpu
            app.t_memory_history = mem
          })
          .catch(err => {
            console.log(err)
          })
      },
      getAppResource () {
        this.$api.metrics.listNamespaceAppResource(this.cluster, this.namespace)
          .then(res => {
            _.forEach(this.deploymentList, item => {
              const resource = _.partition(res.data, {name: item.t_name})[0][0]
              if (resource) {
                item.t_cpu = `${(resource.cpu_utili > 0 && resource.cpu_utili < 0.01) ? '小于1' : (resource.cpu_utili * 100).toFixed(0)}%
                        (${resource.cpu_usage} / ${resource.cpu_request})`
                item.t_memory = `${(resource.mem_utili > 0 && resource.mem_utili < 0.01) ? '小于1' : (resource.mem_utili * 100).toFixed(0)}%
                        (${(resource.mem_usage/1024/1024).toFixed(0)}M /
                        ${(resource.mem_request/1024/1024).toFixed(0)}M)`
              }
            })
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取应用资源使用率失败')
          })
      },
      getAppAddress (app) {
        let internalAddr = []
        const appService = _.filter(this.serviceList, item => this.getAppService(app.metadata.labels).includes(item.metadata.name))
        _.forEach(appService, item => {
          _.forEach(item.spec.ports, port => {
            internalAddr.push(`${item.metadata.name}.${this.namespace}:${port.port}`)
          })
        })
        const ingressAddr = _.get(app, 'metadata.annotations["ingressAddr.jd.com"]')
        const externalAddr = ingressAddr ? ingressAddr.split('/') : []
        app.address = {
          internalAddr,
          externalAddr
        }
      },
      onSelectionChange (selection) {
        this.selectedRows = selection
      },
      getServices () {
        return this.$api.cluster(this.cluster).listServices(this.namespace)
          .then(res => {
            this.serviceList = res.data.items
          })
      },
      getHpas () {
        return this.$api.cluster(this.cluster).listHpas(this.namespace)
          .then(res => {
            this.hpaList = res.data.items
          })
      },
      getAppService (appLabels) {
        var res = []
        _.forEach(this.serviceList, service => {
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
          flag && res.push(service.metadata.name)
        });
        return res;
      },
      getAppHpa (appName) {
        for (var i = 0, len = this.hpaList.length; i < len; i++) {
          if (appName == this.hpaList[i].metadata.name) {
            return [appName]
          }
        }
        return []
      },
      getEndpoints () {
        this.$api.metrics.listEndpoints(this.cluster, this.namespace)
          .then(res => {
            this.endpoints = res.data
          })
          .catch(err => {
            console.log(err)
          })
      },
      deleteDeployments (deployments) {
        let msg = '确定要删除应用吗？'
        if (deployments.length === 1) {
          msg = `确定要删除应用 ${deployments[0].metadata.name} 吗？`
        }
        this.$Modal.confirm({
          title: '删除应用',
          content: msg,
          loading: true,
          onOk: () => {
            let names = [], serviceNames = [], hpaNames = []
            _.forEach(deployments, item => {
              names.push(item.metadata.name)
              // serviceNames = _.concat(serviceNames, this.getAppService(item.metadata.labels))
              hpaNames = _.concat(hpaNames, this.getAppHpa(item.metadata.name))
            })

            this.$api.cluster(this.cluster).deleteDeployments(this.namespace, names)
              .then(res => {
                this.$Message.success('删除应用成功')
                // 删除对应services
                // if (serviceNames.length > 0) {
                //   this.$api.cluster(this.cluster).deleteServices(this.namespace, serviceNames)
                //     .then(res => {
                //       this.getServices()
                //     })
                // }
                // 删除对应hpas
                if (hpaNames.length > 0) {
                  this.$api.cluster(this.cluster).deleteHpas(this.namespace, hpaNames)
                    .then(res => {
                      this.getHpas()
                    })
                }
              })
              .catch(err => {
                this.$NoticeAjaxError(err, '删除应用失败')
              })
              .then(() => {
                this.$Modal.remove()
                this.loadData()
              })
          }
        })
      },
      modifyDeployment (deployment) {

      },
      restartDeployments (deployments) {
        this.$Modal.confirm({
          title: '重启应用',
          content: '确定重新启动应用吗？',
          loading: true,
          onOk: () => {
            console.log(deployments)
            this.$api.cluster(this.cluster).restartDeploymentList(this.namespace, deployments)
              .then(res => {
                this.$Message.success('重启应用成功')
              })
              .catch(err => {
                this.$NoticeAjaxError(err, '重启应用失败')
              })
              .then(() => {
                this.$Modal.remove()
                this.loadData()
              })
          }
        })
      },
      onClickCreate () {
        this.$router.push({name: 'deploy-deployment-create', params: this.$route.params})
      }
    },
    mounted () {
      this.loadData()
      this.interval = window.setInterval(this.loadData, this.updateTime)
    },
    beforeDestroy () {
      window.clearInterval(this.interval)
    },
    watch: {
      $route () {
        this.loadData()
      }
    }
  }
</script>

<style lang="less" scoped>

</style>

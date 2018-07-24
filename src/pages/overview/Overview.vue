<template>
  <div>
    <Spin class="loading" fix size="large" v-if="refreshLoading" />
    <div class="row-1">
      <Row :gutter="16">
        <i-col :span="8" class="item">
          <img :src="applicationSrc" @mouseover="picMove('application', 'in')" @mouseout="picMove('application', 'out')" />
          <span>应用</span>
          <div class="number clickable" @click="goTo('deploy-deployment-list')">
            <span>{{clusterInfo.app_running_num || 0}}</span>
            <span>{{'/' + (clusterInfo.app_total_num || 0)}}</span>
          </div>
        </i-col>
        <i-col :span="8" class="item" >
          <img :src="containerSrc" @mouseover="picMove('container', 'in')" @mouseout="picMove('container', 'out')" />
          <span>容器</span>
          <div class="number clickable" @click="goTo('deploy-deployment-list')">
            <span>{{clusterInfo.pod_running_num || 0}}</span>
            <span>{{'/' + (clusterInfo.pod_total_num || 0)}}</span>
          </div>
        </i-col>
        <i-col :span="8" class="item" style="padding-left: 16px">
          <img :src="alarmSrc" @mouseover="picMove('alarm', 'in')" @mouseout="picMove('alarm', 'out')" />
          <span>告警</span>
          <div class="number"><span>{{clusterInfo.alert_num || 0}}</span></div>
        </i-col>
      </Row>
    </div>
    <br>
    <Row :gutter="16" class="row-2">
      <i-col :span="8" class="card progress-line">
        <Card dis-hover :bordered="false">
          <h4 class="card-header">CPU</h4>
          <div class="card-body">
            <span>分配率</span>
            <Progress :percent="cpuRequestRate" status="active" class="request-rate">
              <span>{{cpuRequestRate | atLeastOne }} %</span>
            </Progress>
            <span>使用率</span>
            <Progress :percent="cpuUsageRate" status="active" class="usage-rate">
              <span>{{cpuUsageRate | atLeastOne }} %</span>
            </Progress>
          </div>
          <div class="card-footer col">
            <div>总共：{{ clusterInfo.cpu_total || 0 }}  CPU</div>
            <div>已分配：{{ clusterInfo.cpu_reuqest || 0 }}  CPU</div>
          </div>
        </Card>
      </i-col>
      <i-col :span="8" class="card progress-line">
        <Card dis-hover :bordered="false">
          <h4 class="card-header">内存</h4>
          <div class="card-body">
            <span>分配率</span>
            <Progress :percent="memRequestRate" status="active" class="request-rate">
              <span>{{memRequestRate | atLeastOne}} %</span>
            </Progress>
            <span>使用率</span>
            <Progress :percent="memUsageRate" status="active" class="usage-rate">
              <span>{{memUsageRate  | atLeastOne}} %</span>
            </Progress>
          </div>
          <div class="card-footer col">
            <div>总共：{{ (clusterInfo.mem_total/1024/1024/1024).toFixed(4) || 0 | round }}  GB</div>
            <div>已分配：{{ (clusterInfo.mem_reuqest/1024/1024/1024).toFixed(4) || 0 | round }}  GB</div>
          </div>
        </Card>
      </i-col>
      <i-col :span="8" class="card storage">
        <Card dis-hover :bordered="false">
          <h4 class="card-header">存储</h4>
          <div class="card-body" style="padding-bottom: 0">
            <Row :gutter="24">
              <i-col :span="12">
                <liquid-chart :data="storagePercentage" />
              </i-col>
              <i-col :span="12" class="text-desc">
                <p>
                  <span>已用配额</span>
                  <span>{{(clusterInfo.storage_quota_used/1024/1024/1024).toFixed(2) || 0 | round}} GB</span>
                </p>
                <p>
                  <span>可用配额</span>
                  <span>{{(clusterInfo.storage_quota_free/1024/1024/1024).toFixed(2) || 0 | round}} GB</span>
                </p>
                <p class="clickable" @click="goTo('deploy-volume-list')">
                  <span>存储卷</span>
                  <span>{{clusterInfo.volume_total_num || 0}} 个</span>
                </p>
                <p class="clickable" @click="goTo('deploy-volume-list', {query: {status: 'Used'}})">
                  <span>使用中</span>
                  <span>{{clusterInfo.volume_used_num || 0}} 个</span>
                </p>
              </i-col>
            </Row>
          </div>
        </Card>
      </i-col>
    </Row>
    <br>
    <Row :gutter="16" class="row-3">
      <i-col :span="8" class="card chart">
        <Card dis-hover :bordered="false">
          <div class="card-body">
            <div class="title" v-if="!globalLoading">应用</div>
            <Spin class="loading" size="large" v-if="globalLoading" />
            <arch-chart :height="250" :width="blockWidth" :data="appChartData" :options="appChartOptions" v-if="blockWidth" />
          </div>
          <div class="card-footer col col-3">
            <div class="clickable" @click="goTo('deploy-deployment-list', {query: {status: '运行中'}})">
              <p>
                <Icon type="android-radio-button-on" :style="{color: COLORS.running}" />
                <span>运行中</span>
              </p>
              <p><span>{{clusterInfo.app_running_num || 0}}</span>个</p>
            </div>
            <div class="center-item clickable" @click="goTo('deploy-deployment-list', {query: {status: '已停止'}})">
              <p>
                <Icon type="android-radio-button-on" :style="{color: COLORS.stopped}" />
                <span>已停止</span>
              </p>
              <p><span>{{clusterInfo.app_stopped_num || 0}}</span>个</p>
            </div>
            <div class="clickable" @click="goTo('deploy-deployment-list', {query: {status: '操作中'}})">
              <p>
                <Icon type="android-radio-button-on" :style="{color: COLORS.operating}" />
                <span>操作中</span>
              </p>
              <p><span>{{clusterInfo.app_inprogress_num || 0}}</span>个</p>
            </div>
          </div>
        </Card>
      </i-col>
      <i-col :span="8" class="card chart">
        <Card dis-hover :bordered="false">
          <div class="card-body">
            <div class="title" v-if="!globalLoading">容器</div>
            <Spin class="loading" size="large" v-if="globalLoading" />
            <arch-chart :height="250" :width="blockWidth" :data="podChartData" :options="appChartOptions" v-if="blockWidth" />
          </div>
          <div class="card-footer col col-3">
            <div class="clickable" @click="goTo('deploy-deployment-list', {query: {status: '运行中'}})">
              <p>
                <Icon type="android-radio-button-on" :style="{color: COLORS.running}" />
                <span>运行中</span>
              </p>
              <p><span>{{clusterInfo.pod_running_num || 0}}</span>个</p>
            </div>
            <div class="center-item clickable" @click="goTo('deploy-deployment-list', {query: {status: '已停止'}})">
              <p>
                <Icon type="android-radio-button-on" :style="{color: COLORS.stopped}" />
                <span>已停止</span>
              </p>
              <p><span>{{clusterInfo.pod_abnormal_num || 0}}</span>个</p>
            </div>
            <div class="clickable" @click="goTo('deploy-deployment-list', {query: {status: '操作中'}})">
              <p>
                <Icon type="android-radio-button-on" :style="{color: COLORS.operating}" />
                <span>操作中</span>
              </p>
              <p><span>{{clusterInfo.pod_inprogress_num || 0}}</span>个</p>
            </div>
          </div>
        </Card>
      </i-col>
      <i-col :span="8" class="card alarm">
        <Card dis-hover :bordered="false">
          <h4 class="card-header alarm-header">告警</h4>
          <div class="card-body">
            <div class="empty-tips" v-if="alarmList.length === 0">
              <p><Icon type="checkmark-circled" size="60" color="#008000" /></p>
              <p>暂无系统告警</p>
             </div>
          </div>
        </Card>
      </i-col>
    </Row>
    <br>
    <Row :gutter="16" class="row-4">
      <i-col :span="8" class="card image">
        <Card dis-hover :bordered="false">
          <h4 class="card-header">镜像仓库</h4>
          <div class="card-body">
            <Spin class="loading" size="large" v-if="imageLoading" />
            <arch-chart :height="180" :width="blockWidth" :data="imageChartData" :options="imageChartOptions" v-if="blockWidth" /> 
            <div class="total">{{this.publicRepo + this.privateRepo}} 个</div>
            <div class="image-desc">
              <Tag type="dot" color="#0099ff" class="custom-tag">
                公有 {{this.publicRepo}} 个
              </Tag>
              <Tag type="dot" color="#66cccc" class="custom-tag">
                私有 {{this.privateRepo}} 个
              </Tag>
            </div>
          </div>
        </Card>
      </i-col>
      <i-col :span="8" class="card cicd">
        <Card dis-hover :bordered="false">
          <h4 class="card-header">CI/CD</h4>
          <div class="card-body">
            <Row :gutter="24">
              <i-col :span="12">
                <img src="../../assets/images/overview/cicd.png" />
              </i-col>
              <i-col :span="12" class="text-desc">
                <p>
                  <span>构建成功</span>
                  <span>{{clusterInfo.cicd_success || 0}} 个</span>
                </p>
                <p>
                  <span>构建失败</span>
                  <span>{{clusterInfo.cicd_failure || 0}} 个</span>
                </p>
                <p>
                  <span>正在构建</span>
                  <span>{{clusterInfo.cicd_building || 0}} 个</span>
                </p>
              </i-col>
            </Row>
          </div>
        </Card>
      </i-col>
      <i-col :span="8" class="card auditlog">
        <Card dis-hover :bordered="false">
          <h4 class="card-header">审计日志</h4>
          <div class="card-body">
            <Spin class="loading" size="large" v-if="logLoading" />
            <div class="empty-tips" v-if="!logLoading && auditLogs.length === 0">暂无审计日志</div>
            <Timeline pending v-if="auditLogs.length > 0">
              <TimelineItem v-for="(log, idx) in auditLogs" :key="idx">
                <p class="log-operator">{{log.username}}</p>
                <p class="log-detail">{{log.timestamp + ' ' + log.verb + ' ' + log.requestURI}}`</p>
              </TimelineItem>
              <TimelineItem>
                <a herf="" @click.prevent="goAuditLog">查看更多</a>
              </TimelineItem>
            </Timeline>
          </div>
        </Card>
      </i-col>
    </Row>
  </div>
</template>

<script>
  import dayjs from 'dayjs'
  import ArchChart from './ArchChart'
  import LiquidChart from './LiquidChart'
  import {COLORS} from '@/pars'

  export default {
    name: "overview",
    components: {ArchChart, LiquidChart},
    props: {
      cluster: String,
      namespace: String
    },
    data () {
      return {
        COLORS: COLORS,
        interval: null,
        updateTime: 30000,
        blockWidth: null,
        refreshLoading: false,
        globalLoading: true,
        imageLoading: true,
        logLoading: true,
        clusterInfo: {},
        storagePercentage: [0],
        alarmList: [],
        auditLogs: [],
        appChartData: [],
        podChartData: [],
        appChartOptions: {
          lineWidth: 8,
          lineCap: 'round',
          miterLimit: 'round'
        },
        imageChartData: [],
        imageChartOptions: {
          lineWidth: 10
        },
        publicRepo: 0,
        privateRepo: 0,
        applicationSrc: require('../../assets/images/overview/application.png'),
        containerSrc: require('../../assets/images/overview/container.png'),
        alarmSrc: require('../../assets/images/overview/alarm.png')
      }
    },
    computed: {
      cpuUsageRate () {
        return Math.round(this.clusterInfo.cpu_usage_rate * 100 || 0)
      },
      cpuRequestRate () {
        return Math.round(this.clusterInfo.cpu_request_rate * 100 || 0)
      },
      memUsageRate () {
        return Math.round(this.clusterInfo.mem_usage_rate * 100 || 0)
      },
      memRequestRate () {
        return Math.round(this.clusterInfo.mem_request_rate * 100 || 0)
      }
    },
    methods: {
      picMove (resource, type) {
        if (resource === 'application') {
          this.applicationSrc = require(`../../assets/images/overview/${resource}-${type}.gif`)
        } else if (resource === 'container') {
          this.containerSrc = require(`../../assets/images/overview/${resource}-${type}.gif`)
        } else {
          this.alarmSrc = require(`../../assets/images/overview/${resource}-${type}.gif`)
        }
      },
      loadData () {
        this.getGlobalInfo()
        this.getAuditLog()
        this.getImageRepo()
      },
      getGlobalInfo () {
        this.$api.overview.listNamespaceInfo(this.cluster, this.namespace)
          .then(response => {
            this.clusterInfo = response.data

            const data = response.data

            this.storagePercentage = data.storage_quota_used + data.storage_quota_free === 0 ? [0] : [data.storage_quota_used / (data.storage_quota_used + data.storage_quota_free)]

            const appTotal = data.app_total_num
            const appRunningPercentage = (appTotal === 0) ? 0 : data.app_running_num/appTotal
            const appStoppedPercentage = (appTotal === 0) ? 0 : data.app_stopped_num/appTotal
            const appInprogressPercentage = (appTotal === 0) ? 0 : data.app_inprogress_num/appTotal
            this.appChartData = [
              {value: appRunningPercentage, color: COLORS.running},
              {value: appStoppedPercentage, color: COLORS.stopped},
              {value: appInprogressPercentage, color: COLORS.operating}
            ]

            const podTotal = data.pod_total_num
            const podRunningPercentage = (podTotal === 0) ? 0 : data.pod_running_num/podTotal
            const podAbnormalPercentage = (podTotal === 0) ? 0 : data.pod_abnormal_num/podTotal
            const podInprogressPercentage = (podTotal === 0) ? 0 : data.pod_inprogress_num/podTotal
            this.podChartData = [
              {value: podRunningPercentage, color: COLORS.running},
              {value: podAbnormalPercentage, color: COLORS.stopped},
              {value: podInprogressPercentage, color: COLORS.operating}
            ]
            this.globalLoading = false
            this.refreshLoading = false;
          })
      },
      getImageRepo () {
        Promise.all([
          this.$api.image.listImage({scope: 'public'}),
          this.$api.image.listImage({scope: 'private'})
        ]).then(res => {
            this.publicRepo = res[0].data.repositories.length
            this.privateRepo = res[1].data.repositories.length

            const total = this.publicRepo + this.privateRepo
            const publicPercentage = (total === 0) ? 0.49 : this.publicRepo/total - 0.01
            const privatePercentage = (total === 0) ? 0.49 : this.privateRepo/total - 0.01

            this.imageChartData = [
              {value: publicPercentage, color: COLORS.running},
              {value: 0.02, color: 'transparent'},
              {value: privatePercentage, color: COLORS.operating}
            ]
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '加载日志失败')
          })
          .finally(() => {
            this.imageLoading = false
          })
      },
      getAuditLog () {
        const params = {
          limit: 100,
          namespace: this.namespace,
          begin: dayjs(new Date().getTime() - 1000*3600*24*3).toJSON(),
          end: dayjs(new Date()).toJSON()
        }
        this.$api.log.getAuditLogs(this.cluster, {params})
          .then(res => {
            this.logLoading = false
            this.auditLogs = this.getTableData(res.data).slice(0, 4)
          })
          .catch(err => {
            this.logLoading = false
            this.$NoticeAjaxError(err, '加载日志失败')
          })
      },
      formatTime (timestamp) {
        const time = new Date(timestamp).getTime()
        const now = new Date().getTime()
        const days = (now - time) / (1000*3600*24)
        return days < 1 ? '今天' : (Math.floor(days) + '天前')
        return Math.round(((now - time) / (1000*3600*24))) + '天前'
      },
      getTableData (data) {
        return data.hits.hits.map(item => {
          return {
            username: item._source.username || '',
            timestamp: this.formatTime(item._source['@timestamp']),
            requestURI: item._source.requestURI || 'NA',
            verb: item._source.verb || 'NA'
          }
        })
      },
      goAuditLog () {
        this.$router.push({
          name: 'log-audit-log-list',
          params: this.$route.params
        })
      },
      goTo (routeName, extra) {
        this.$router.push(_.merge(
          {
            name: routeName,
            params: {...this.$route.params}
          }, extra)
        )
      },
    },
    created () {
      this.loadData()
      this.interval = window.setInterval(this.getGlobalInfo, this.updateTime)
    },
    mounted () {
      // mount 触发时，页面布局尚未计算navMenu
      setTimeout(() => {
        this.blockWidth = document.querySelector('.card-body').offsetWidth
      }, 10)
      this.onresize = () => {
        this.blockWidth = document.querySelector('.card-body').offsetWidth
      }
      window.addEventListener('resize', this.onresize)
    },
    beforeDestroy () {
      window.clearInterval(this.interval)
      window.removeEventListener('resize', this.onresize)
    },
    watch: {
      $route () {
        this.refreshLoading = true
        this.loadData()
      }
    },
    filters: {
      atLeastOne (value) {
        return value > 1 ? value : 1
      }
    }
  }
</script>

<style scoped lang="less">
  .row-1 {
    background-color: #fff;
    padding: 16px 0;
    .item {
      font-size: 14px;
      border-right: 1px solid #eee;
      display: inline-flex;
      align-items: center;
      &:last-child {
        border-right: 0;
      }
      >img {
        margin-left: 10px;
      }
      >span {
        font-weight: 700;
        margin-left: 16px;
      }
      .number {
        flex-grow: 2;
        text-align: right;
        margin-right: 50px;
        span:last-child {
          color: #ccc;
        }
        span:first-child {
          color: inherit;
          font-size: 28px;
          font-weight: 700;
          margin-right: 5px
        }
      }
    }
  }

  .row-2 .card {
    height: 155px;
  }
  .row-3 .card, .row-4 .card {
    height: 320px;
  }

  .card > div {
    height: 100%;
    /deep/ .ivu-card-body {
      height: 100%;
    }
  }
  .card-header {
    margin: -8px -16px 0;
    padding-bottom: 8px;
    text-align: center;
    box-shadow: 0 1px 1px #eee;
  }

  .row-4 .card-header, &.alarm .card-header {
    margin: 16px 0 16px;
    box-shadow: none;
    padding: 0;
  }
  .card-body {
    position: relative;
    padding: 16px 0;
    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translateX(-50%);
    }
  }
  .card {
    overflow: hidden;
    &.progress-line .card-body {
      height: 80px;
      >span {
        display:inline-block;
        width: 70px;
      }
      >div {
        width: calc(100% - 75px);
      }
      .request-rate /deep/ .ivu-progress-bg {
        background-color: #66cccc;
      }
      .usage-rate /deep/ .ivu-progress-text{
        color: inherit;
      }
      .usage-rate /deep/ .ivu-progress-bg {
        background-color: #2db7f5;
      }
    }
    &.chart .card-body {
      padding: 0;
      margin-top: -16px;
      .title {
        position: absolute;
        top: 60%;
        left: 50%;
        transform: translateX(-50%);
      }
    }
    &.alarm .card-body, &.auditlog .card-body {
      padding-left: 20px;
      .empty-tips {
        margin-left: -20px;
        margin-top: 50px;
        opacity: 0.7;
        font-size: 16px;
        text-align: center;
      }
      .log-operator, .log-detail {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      /deep/ .ivu-timeline-item {
        padding-bottom: 0;
        .ivu-timeline-item-content {
          padding-bottom: 5px;
        }
      }
    }

    &.image .card-body {
      height: 228px;
      .total {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateX(-50%)
      }
      .image-desc {
        position: absolute;
        bottom: 40px;
        left: 18%;
        right: 18%;
        display: flex;
        justify-content: space-around; 
        span {
          white-space: nowrap;
        }
      }
    }

    &.cicd .card-body, &.image .card-body {
      position: relative;
      padding-bottom: 32px;
      &:before, &:after {
        content: '';
        position: absolute;
        top: 16px;
        left: 10%;
        width: 80%;
        height: 1px;
        background-color: #ccc;
      }
      &:after {
        top: initial;
        bottom: 32px;
      }
    }

    &.cicd {
      .card-body{
        /deep/ .ivu-row {
          height: 180px;
        }
        img {
          margin-top: 10px;
          float: right;
        } 
      }
      .text-desc p:nth-child(2) {
        margin: 5px 0;
      }
    }
    .text-desc {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translateY(-50%);
      p {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        span:first-child {
          display: inline-block;
          width: 100px;
        }
      }
    }
  }
  .card-footer {
    padding-top: 8px;
    margin: 0 -16px -8px;
    box-shadow: 0 -1px 1px #eee;
    text-align: center;
    &.col{
      display: flex;
      justify-content: space-around;
    }
    .item {
      border-left: 1px solid #eee;
      &:first-child {
        border-left: 0;
      }
    }
    &.col-3 .item {
      width: 33.33%;
    }
    &.col-4 .item {
      width: 25%;
    }
    .center-item {
      width: 33.33%;
      border-left: 1px solid #eee;
      border-right: 1px solid #eee;
    }
  }

  .custom-tag {
    padding: 0;
    border: 0!important;
  }
  .clickable {
    cursor: pointer;
  }

</style>

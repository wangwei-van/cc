<template>
  <Card :class="{'full-screen': fullScreen}" :style="leftStyle" dis-hover>
    <div slot="title">
      <label for="">Pod: </label>
      <Select v-model="selectedPodName" @on-change="loadData" transfer style="width: 350px;">
        <Option v-for="pod in podList"
                :key="pod.metadata.name"
                :value="pod.metadata.name">
          {{pod.metadata.name}}
        </Option>
      </Select>
    </div>
    <div slot="extra">
      <ButtonGroup v-show="showMode === 'latest'" :style="{marginRight: '10px'}">
        <Button class="btn" size="small" :class="{'ivu-btn-info': latestLimit==='30'}" @click="changeLimits('30')" style="width:60px">30条</Button>
        <Button class="btn" size="small" :class="{'ivu-btn-info': latestLimit==='50'}" @click="changeLimits('50')" style="width:60px">50条</Button>
        <Button class="btn" size="small" :class="{'ivu-btn-info': latestLimit==='100'}" @click="changeLimits('100')" style="width:60px">100条</Button>
      </ButtonGroup>

      <DatePicker v-model="datePeriod"
                  :options="dateOptions"
                  @on-ok="changeDate"
                  type="datetimerange"
                  placeholder="选择时间段"
                  placement="bottom-end"
                  v-show="showMode === 'period'"
                  style="margin-right: 10px;width: 280px"
                  transfer>
      </DatePicker>

      <RadioGroup v-model="showMode" @on-change="loadData">
        <Radio label="latest">最近</Radio>
        <Radio label="follow">实时</Radio>
        <Radio label="period">时间段</Radio>
      </RadioGroup>

      <i-input v-model="searchText"
                placeholder="请输入关键字搜索"
                icon="search"
                @on-enter="loadData"
                style="width: 200px;">
      </i-input>

      <i class="icons">
        <Icon type="arrow-expand" @click.native="fullScreen = true" title="最大化" v-if="!fullScreen" />
        <Icon type="arrow-shrink" @click.native="fullScreen = false" title="还原" v-if="fullScreen" />
      </i>

    </div>

    <div class="log-list" @mousewheel="manualScroll" v-if="showMode === 'latest'" v-back-to:up v-back-to:down>
      <Spin size="large" fix v-if="reloading"></Spin>
      <pre v-if="!podError">{{logs}}</pre>
      <div class="tips" v-if="!reloading && !logs">
        <p>暂无日志信息</p>
      </div>
      <div class="tips" v-if="podError">
        <p>实例未成功启动，暂无日志信息</p>
      </div>
    </div>

    <div class="log-list" @mousewheel="manualScroll" v-if="showMode === 'follow'">
      <Spin size="large" fix v-if="reloading"></Spin>
      <pre v-if="!podError">{{logs}}</pre>
      <div class="tips" v-if="!reloading && !logs">
        <p>暂无日志信息</p>
      </div>
      <div class="tips" v-if="podError">
        <p>实例未成功启动，暂无日志信息</p>
      </div>
    </div>

    <div class="log-list-infinite" infinite-wrapper v-if="showMode === 'period'" v-back-to:up v-back-to:down>
      <p v-for="item in logList" :key="item.time">
        {{item._source.log}}
      </p>
      <infinite-loading @infinite="infiniteHandler" spinner="waveDots" force-use-infinite-wrapper="true" ref="infiniteLoading">
        <p slot="no-results" class="tips">暂无日志信息</p>
      </infinite-loading>
    </div>
  </Card>
</template>

<script>
  import axios from 'axios'
  const CancelToken = axios.CancelToken
  import InfiniteLoading from 'vue-infinite-loading'
  import dayjs from 'dayjs'
  import store from '@/store'

  export default {
    name: "log",
    props: {
      cluster: String,
      namespace: String,
      podList: {
        type: Array,
        default: () => []
      }
    },
    components: { InfiniteLoading },
    data () {
      return {
        logs: '',
        logList: [],
        podError: false,
        reloading: false,
        selectedPodName: '',
        fullScreen: false,
        searchText: '', // 时间段日志后台过滤，其他两种前端过滤
        showMode: 'latest',
        latestLimit: '30',
        datePeriod: [new Date(new Date().getTime() - 1000 * 60 * 60 * 24), new Date()],
        source: null,
        autoScroll: true,
        dateOptions: {
          shortcuts: [
            {
              text: '1 day',
              value () {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24);
                return [start, end];
              }
            },
            {
              text: '1 week',
              value () {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                return [start, end];
              }
            },
            {
              text: '1 month',
              value () {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                return [start, end];
              }
            },
            {
              text: '3 months',
              value () {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                return [start, end];
              }
            }
          ]
        }
      }
    },
    computed: {
      leftStyle () {
        if (this.fullScreen) {
          return {left: localStorage.getItem('nav-collapsed') === 'true' ? '60px' : '200px'}
        }
        return {} 
      }
    },
    methods: {
      // 保证直接编辑输入框能够取得正确的时间
      changeDate () {
        setTimeout(this.loadData, 1)
      },
      loadData () {
        if (this.showMode !== 'period') {
          // 实时或最近的日志
          this.reloading = true
          this.startLoadLog()
        } else {
          // 时间段内的日志
          if (!this.selectedPodName) return
            this.logList = []
            this.cancelRequest()
            this.$nextTick(() => {
              this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset')
            })
          }
      },
      infiniteHandler ($state) {
        if (!this.selectedPodName || !this.datePeriod[0] || !this.datePeriod[1]) {
          $state.complete()
          return
        }
        this.source = CancelToken.source()
        const params = {
          limit: 100,
          query: this.searchText
        }
        if (this.logList.length === 0) {
          params.begin = dayjs(this.datePeriod[0]).toJSON()
        } else {
          params.begin = _.last(this.logList)['_source']['@timestamp']
        }
        params.end = dayjs(this.datePeriod[1]).toJSON()

        this.$api.log.getPodPeriodLog(this.cluster, this.namespace, this.selectedPodName, {
          cancelToken: this.source.token,
          params
        })
        .then((res) => {
          if (res.data.hits.hits.length === 0) {
            $state.complete()
          } else {
            this.logList = this.logList.concat(res.data.hits.hits)
            $state.loaded()
          }

        })
        .catch(err => {
          $state.complete()
          this.$NoticeAjaxError(err, '加载日志失败')
        })
      },
      startLoadLog () {
        if (!this.selectedPodName) return
        this.logs = ''
        this.cancelRequest()
        let params = {}
        if (this.showMode === 'latest') {
          params.tailLines = this.latestLimit
        } else {
          params.tailLines = 10
          params.follow = true
        }
        this.source = CancelToken.source()
        this.$api.cluster(this.cluster).getPodLog(this.namespace, this.selectedPodName, {
            cancelToken: this.source.token,
            params,
            onDownloadProgress: (progeressEvent) => {
              this.podError = false
              this.reloading = false
              // this.logs = progeressEvent.target.responseText
              const res = progeressEvent.target.responseText
              this.logs = _.filter(res.split('\n'), item => {
                return _.includes(item.toLowerCase(), this.searchText.toLowerCase())
              }).join('\n')
              if (this.showMode === 'follow') {
                setTimeout(() => {
                  let wrapper = document.querySelectorAll('.log-list')[0]
                  const top = document.querySelectorAll('pre')[0].scrollHeight
                  this.autoScroll && (wrapper.scrollTop = top);
                }, 0)
              }
            }
          })
          .catch(err => {
            this.reloading = false
            // 从未启动成功过的pod没有吐日志，导致报400错误
            if (err.response && err.response.status === 400) {
              this.podError = true
            }
            if (err.message !== 'canceled') {
              this.$NoticeAjaxError(err, '获取日志失败')
            }
          }).then(res => {
            this.reloading = false
          })
      },
      changeLimits (limits) {
        this.latestLimit = limits
        this.loadData()
      },
      cancelRequest () {
        if (this.source) {
          this.source.cancel('canceled')
        }
      },
      // 向上滚动的时候停止自动滚动效果，然后再次想下滚动到一定距离开始自动滚动
      manualScroll (evt) {
        event.delta = (event.wheelDelta) ? event.wheelDelta/120 : -(event.detail || 0)/3; 
        if (event.delta > 0) {
          this.autoScroll = false
        } else {
          if (evt.currentTarget.scrollHeight < evt.currentTarget.scrollTop + 500) {
            this.autoScroll = true
          }
        }
      }
    },
    created () {
      this.selectedPodName = _.get(this.podList, '0.metadata.name') || ''
      this.loadData()
    }
  }
</script>

<style scoped lang="less">
  @import '../../../style/variable';

  .tool-bar {
    border-bottom: 1px solid @border-color-split;
    padding: 10px;
  }
  /deep/ .ivu-card-body {
    position: relative;
  }

  .full-screen {
    position: fixed;
    top: 50px;
    right: 0;
    bottom: 0;
    z-index: 100;
    /deep/ .ivu-card-body {
      height: calc(100% - 60px);
    }
    .log-list, .log-list-infinite {
      max-height: 100%;
      height: 100%;
    }
  }
  .icons {
    vertical-align: text-top;
    margin-left: 10px;
    i {
      cursor: pointer
    }
  }

  .log-list {
    position: relative;
    max-height: calc(100vh - 500px);
    min-height: 200px;
    overflow-y: auto;
    pre {
      white-space: pre-wrap;
      word-break: break-all;
      word-wrap: break-word;
    }
  }

  .log-list-infinite {
    max-height: calc(100vh - 500px);
    min-height: 200px;
    overflow-y: auto;
    p {
      word-break: break-all;
      word-wrap: break-word;
    }
  }

  .tips {
    text-align: center;
    opacity: 0.7;
  }

</style>

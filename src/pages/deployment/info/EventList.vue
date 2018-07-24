<template>
  <div >
    <div class="tool-bar">
      <label for="">Pod: </label>
      <Select v-model="podName" @on-change="reloadData" transfer style="width: 350px;">
        <Option value="all">All</Option>
        <Option v-for="pod in podList"
                :key="pod.metadata.name"
                :value="pod.metadata.name">
          {{pod.metadata.name}}
        </Option>
      </Select>

      <ButtonGroup>
        <Button class="btn" :class="{'ivu-btn-info': type==='All'}" @click="changeType('All')" style="width:80px">All</Button>
        <Button class="btn" :class="{'ivu-btn-info': type==='Warning'}" @click="changeType('Warning')" style="width:80px">Warning</Button>
        <Button class="btn" :class="{'ivu-btn-info': type==='Normal'}" @click="changeType('Normal')" style="width:80px">Normal</Button>
      </ButtonGroup>

      <Button type="info" icon="loop" style="float: right;"
              :disabled="!podName"
              @click="reloadData">刷新</Button>

    </div>
    <Table :columns="cols"
           :data="tableData"
           :loading="loading"
           size="small"
           stripe>
    </Table>

  </div>

</template>

<script>
  import _ from 'lodash'
  import dayjs from 'dayjs'

  export default {
    name: 'event-list',
    props: {
      cluster: String,
      namespace: String,
      deployment: String,
      podList: {
        type: Array,
        default: () => []
      }
    },
    data () {
      return {
        type: 'All',
        cols: [
          {key: 'reason', title: '事件'},
          {key: 'message', title: '消息'},
          {
            key: 'eventSource',
            title: '源',
            render: (h, params) => {
              const source = params.row.source
              const content = _.keys(source)
                .filter(key => key !== 'component')
                .map(key => `${key}: ${source[key]}`)
                .join(',')
              const disabled = _.isEmpty(content)
              return h('Tooltip', {props: {content, disabled, placement: 'right'}}, source.component)
            }
          },
          {
            key: 'lastTimestamp',
            title: '触发时间',
            width: 180,
            render: (h, params) => {
              const date = new Date(params.row.lastTimestamp)
              const timestamp = dayjs(date).format('YYYY-MM-DD HH:mm:ss')
              return h(
                'span',
                {},
                timestamp
              )
            }
          },
          {
            key: 'count',
            title: '次数',
            width: 120,
            render: (h, params) => {
              const style = params.row.count > 1 ? {color: 'red'} : {}
              return h(
                'span',
                {style},
                params.row.count
              )
            }
          },
        ],
        tableData: [],
        podName: 'all',
        loading: false
      }
    },
    methods: {
      reloadData () {
        if (this.type === 'Warning') {
          this.cols.push({
            key: 'operation', title: '操作', width: 100,
            render: (h, params) => {
              return h(
                'Icon',
                {
                  props: {type: 'trash-b'},
                  class: {'table-tool-icon': true},
                  nativeOn: {
                    click: () => this.deleteWarningEvent([params.row.metadata.name])
                  }
                })
            }
          })
        } else if (this.cols.length === 6) {
          this.cols.pop()
        }
        // pod
        if (this.podName === 'all') {
          this.getAllDeploymentEvent()
        } else {
          this.getPodEvent()
        }
      },
      changeType (type) {
        this.type = type
        this.reloadData()
      },
      getAllDeploymentEvent () {
        this.loading = true
        const fieldSelector = {}
        // type
        if (this.type !== 'All') {
          fieldSelector.type = this.type
        }
        this.$api.cluster(this.cluster).listPodEvents(this.namespace, fieldSelector)
          .then(res => {
            this.tableData = res.data.items.filter(
              item => _.get(item, 'involvedObject.name', '').startsWith(this.deployment + '-')
            )
            if (this.type === 'Warning') {
              this.tableData = this.tableData.filter(
                item => _.get(item, 'metadata.annotations.handled') !== 'true'
              )
              this.$emit('change-count', this.tableData.length)
            }
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取事件列表失败')
          })
          .then(() => {
            this.loading = false
          })

      },
      getPodEvent() {
        this.loading = true
        const selectedPod = _(this.podList).filter(pod => pod.metadata.name === this.podName).first()
        const fieldSelector = {
          'involvedObject.uid': selectedPod.metadata.uid
        }
        // type
        if (this.type !== 'All') {
          fieldSelector.type = this.type
        }
        this.$api.cluster(this.cluster).listPodEvents(this.namespace, fieldSelector)
          .then(res => {
            this.tableData = res.data.items
            if (this.type === 'Warning') {
              this.tableData = this.tableData.filter(
                item => _.get(item, 'metadata.annotations.handled') !== 'true'
              )
              this.$emit('change-count', this.tableData.length)
            }
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取事件列表失败')
          })
          .then(() => {
            this.loading = false
          })
      },
      deleteWarningEvent (name) {
        this.$Modal.confirm({
          title: '删除事件',
          content: '该告警事件已处理完成？',
          loading: true,
          onOk: () => {
            const data = {
              metadata: {
                annotations: {
                  handled: 'true'
                }
              }
            }
            this.$api.cluster(this.cluster).patchPodEvent(this.namespace, name, data)
              .then(res => {
                this.reloadData()
              })
              .catch(err => {
                this.$NoticeAjaxError(err, '删除告警事件失败')
              })
              .then(() => {
                this.$Modal.remove()
              })
          }
        })
      }
    },
    created () {
      this.reloadData()
    }
  }
</script>

<style lang="less" scoped>
  .tool-bar {
    margin-bottom: 10px;
  }
</style>

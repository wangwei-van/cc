<template>
  <div>
    <div class="tool-bar">
      <Select v-model="selectedName" @on-change="reloadData" transfer style="width: 350px;">
        <OptionGroup label="应用">
          <Option v-for="app in appList" :key="app" :value="app">{{app}}</Option>
        </OptionGroup>
        <OptionGroup label="实例">
          <Option v-for="pod in podList"
                  :key="pod.metadata.name"
                  :value="pod.metadata.name">
            {{pod.metadata.name}}
          </Option>
        </OptionGroup>
      </Select>

      <Button type="info" icon="loop" style="float: right;"
              @click="reloadData">刷新</Button>

    </div>
    <Card dis-hover style="margin: 10px 0;">
      <Row>
        <i-col :span="12">
          <LineChart :data="cpuUtiliData"
                     :loading="utiliLoading"
                     :chartWidth="chartWidth"
                      unit="%"
                      title="CPU 使用率">
          </LineChart>
        </i-col>
        <i-col :span="12">
          <LineChart :data="memUtiliData"
                     :loading="utiliLoading"
                     :chartWidth="chartWidth"
                      unit="%"
                      title="内存使用率">
          </LineChart>
        </i-col>
      </Row>
    </Card>
  </div>
</template>

<script>
  export default {
    name: 'pod-monitor',
    props: {
      cluster: String,
      namespace: String,
      appName: String,
      podList: {
        type: Array,
        default: () => []
      },
      width: Number
    },
    data () {
      return {
        selectedName: this.appName,
        utiliLoading: true,
        cpuUtiliData: {x: [], y: []},
        memUtiliData: {x: [], y: []},
        chartWidth: this.width / 2 - 60 + 'px'
      }
    },
    computed: {
      appList () {
        return [this.appName]
      }
    },
    methods: {
      reloadData () {
        let promise = null
        if (this.selectedName === this.appName) {
          promise = this.$api.metrics.listAppHistory(this.cluster, this.namespace, this.selectedName)
        } else {
          promise = this.$api.metrics.listPodHistory(this.cluster, this.namespace, this.selectedName)
        }
      
        promise.then(res => {
          this.utiliLoading = false
          let cpuX = [], cpuY = [], memY = []
          res.data.map(item => {
            cpuX.push(item.timestamp)
            cpuY.push(item.cpu_utili * 100)
            memY.push(item.mem_utili * 100)
          })
          this.cpuUtiliData = {x: cpuX, y:cpuY}
          this.memUtiliData = {x: cpuX, y:memY}
        })
        .catch(err => {
          this.$NoticeAjaxError(err, '获取监控信息失败')
        })
      }
    },
    created () {
      this.reloadData()
    }
  }
</script>

<style lang="less" scoped>
</style>
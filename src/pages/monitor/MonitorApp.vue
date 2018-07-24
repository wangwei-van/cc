<template>
  <div>
    <Breadcrumb class="custom-breadcrumb">
      <BreadcrumbItem>监控</BreadcrumbItem>
      <BreadcrumbItem :to="backUrl">应用</BreadcrumbItem>
      <BreadcrumbItem>{{app}}</BreadcrumbItem>
    </Breadcrumb>

    <Card dis-hover style="margin-bottom: 10px;">
      <div style="margin-bottom: 20px;">
        <ButtonRadioGroup v-model="selected" :options="options" multiple></ButtonRadioGroup>
      </div>
      <MultiLineChart :data="plotData"></MultiLineChart>
    </Card>
  </div>

</template>

<script>
  import MultiLineChart from './MultiLineChart'

  export default {
    name: "MonitorApp",
    components: { MultiLineChart },
    props: {
      cluster: String,
      namespace: String,
      app: String
    },
    data () {
      return {
        utiliLoading: true,
        // cpuUtiliData: {x: [], y:[]},
        // memUtiliData: {x: [], y:[]},
        // netRxData: {x: [], y: []}, // 入流量
        // netTxData: {x: [], y: []}, // 出流量
        selected: ['all'],
        podList: [],
        loadCount: 0,
        interval: null,
        plotData: {}
      }
    },
    computed: {
      backUrl () {
        return {
          name: 'monitor-app-list',
          params: {
            cluster: this.cluster
          }
        }
      },
      options () {
        return [
          {value: 'all', label: this.app},
          ...this.podList
        ]
      }
    },
    methods: {
      loadData () {
        this.loadPodList()
        this.loadUtiliData()
      },
      loadUtiliData () {
        this.loadCount++
        const thisCount = this.loadCount
        const selected = [...this.selected]
        this.utiliLoading = true
        Promise.all(selected.map(pod => this.requestUtiliData(pod)))
          .then(resList => {
            if (thisCount !== this.loadCount) return
            this.plotData = _.zipObject(selected, resList.map(item => item.data))
          })
          .catch(err => {
            if (thisCount !== this.loadCount) return
            this.$NoticeAjaxError(err, '获取使用率数据失败')
          })
          .then(() => this.utiliLoading = false)
      },
      requestUtiliData (pod) {
        if (pod === 'all') {
          return this.$api.metrics.listAppHistory(this.cluster, this.namespace, this.app)
        } else {
          return this.$api.metrics.listPodHistory(this.cluster, this.namespace, pod)
        }
      },
      loadPodList () {
        this.$api.cluster(this.cluster).getDeploymentInfo(this.namespace, this.app)
          .then(res => this.$api.cluster(this.cluster).listPods(this.namespace, res.data))
          .then(res => {
            this.podList = res.data.items.map(item => {
              return {
                value: item.metadata.name,
                label: item.metadata.name
              }
            })
            this.selectedPod = _.get(this.podList, '0.value', '')
            this.podLoading = false
          })
      },
      startInterval () {
        setInterval(() => {
          this.loadUtiliData()
        }, 30000)
      },
    },
    created () {
      this.loadData()
      this.startInterval()
    },
    watch: {
      $route () {
        this.$router.push({name: 'monitor-app-list', params: this.$route.params})
      },
      selected (newVal) {
        this.loadUtiliData()
      }
    },
    beforeDestroy () {
      try {
        clearInterval(this.interval)
      } catch (err) {}
    }
  }
</script>

<style scoped lang="less">

</style>

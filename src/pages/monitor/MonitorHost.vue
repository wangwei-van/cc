<template>
  <div>
    <Breadcrumb class="custom-breadcrumb">
      <BreadcrumbItem>监控</BreadcrumbItem>
      <BreadcrumbItem :to="backUrl">主机</BreadcrumbItem>
      <BreadcrumbItem>{{host}}</BreadcrumbItem>
    </Breadcrumb>

    <Card dis-hover style="margin-bottom: 10px;">
      <Row>
        <i-col :span="12">
          <LineChart :data="cpuUtiliData"
                     :loading="utiliLoading"
                      unit="%"
                      title="CPU 使用率">
          </LineChart>
        </i-col>
        <i-col :span="12">
          <LineChart :data="memUtiliData"
                     :loading="utiliLoading"
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
    name: "MonitorHost",
    props: {
      cluster: String,
      host: String
    },
    data () {
      return {
        utiliLoading: true,
        cpuUtiliData: {x: [], y:[]},
        memUtiliData: {x: [], y:[]}
      }
    },
    computed: {
      backUrl () {
        return {
          name: 'monitor-host-list',
          params: {
            cluster: this.cluster
          }
        }
      }
    },
    methods: {
      loadData () {
        return this.$api.metrics.listHostUtili(this.cluster, this.host)
          .then(res => {
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
            this.$NoticeAjaxError(err, '获取使用率数据失败')
          })
      },
    },
    created () {
      this.loadData()
    },
    watch: {
      $route () {
        this.$router.push({name: 'monitor-host-list', params: this.$route.params})
      }
    }
  }
</script>

<style scoped lang="less">

</style>

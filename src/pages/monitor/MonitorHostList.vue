<template>
  <div>
    <Breadcrumb class="custom-breadcrumb">
      <BreadcrumbItem>监控</BreadcrumbItem>
      <BreadcrumbItem>主机</BreadcrumbItem>
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

    <Tabs type="card" class="custom-tabs">
      <TabPane label="主机列表">
        <div style="margin-bottom: 10px; text-align: right;">
          <i-input v-model="hostSearchText" icon="search" style="width: 200px; margin-right: 5px;"></i-input>
          <Button type="info" icon="refresh" @click="loadHostData">刷新</Button>
        </div>
        <DataTable :columns="cols"
                   :data="hostList"
                   :search-text="hostSearchText"
                   stripe>
        </DataTable>
        <Spin fix v-if="hostLoading"></Spin>
      </TabPane>
    </Tabs>

  </div>

</template>

<script>
  import {COLORS} from '@/pars'

  const statusColor = status => {
    switch (status.toString()) {
      case '0':
        return COLORS.error
      case '1':
        return COLORS.success
    }
    return COLORS.info
  }

  export default {
    name: "MonitorHostList",
    props: {
      cluster: String
    },
    data () {
      return {
        hostLoading: false,
        hostList: [],
        cols: [
          {
            key: 'name',
            title: '主机',
            searchable: true,
            sortable: true,
            render: (h, params) => {
              return h(
                'a',
                {
                  on: {
                    click: () => this.onClickHost(params.row.name)
                  }
                },
                params.row.name
              )
            }
          },
          {
            key: 'status',
            title: '状态',
            sortable: true,
            render: (h, params) => {
              return h(
                'span',
                {
                  style: {
                    color: statusColor(params.row.status)
                  }
                },
                {'0': '停止', '1': '运行中'}[params.row.status]
              )
            }
          },
          {
            key: 'cpu_utili',
            title: 'CPU',
            render: (h, params) => {
              const value = params.row.cpu_utili * 100
              const text = value.toFixed(0) + '%'
              return h(
                  'i-circle',
                  {
                    props: {
                      percent: value,
                      size: 38
                    },
                    style: {verticalAlign: 'middle', marginRight: '8px'}
                  },
                  text
                )
            }
          },
          {
            key: 'mem_utili',
            title: '内存（G）',
            render: (h, params) => {
              const value = params.row.mem_total ? (params.row.mem_usage / params.row.mem_total)*100 : 0
              const text = value.toFixed(0) + '%'
              return h('div', [
                h(
                  'i-circle',
                  {
                    props: {
                      percent: value,
                      size: 38
                    },
                    style: {verticalAlign: 'middle', marginRight: '8px'}
                  },
                  text
                ),
                h('span', (params.row.mem_usage/1024/1024/1024).toFixed(0) + '/' + (params.row.mem_total/1024/1024/1024).toFixed(0))
              ])
            }
          },
          {key: 'pod_num', title: 'Pod数量', sortable: true},
        ],
        hostSearchText: '',
        // timeStep: 5,
        // timeInterval: null,
        // updateTime: 5000,
        utiliLoading: true,
        cpuUtiliData: {},
        memUtiliData: {}
      }
    },
    methods: {
      loadHostData () {
        this.hostLoading = true
        this.$api.metrics.listClusterHosts(this.cluster)
          .then(res => {
            this.hostList = res.data || []
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取host列表失败')
          })
          .then(() => {
            this.hostLoading = false
          })
      },
      loadUtiliData () {
        return this.$api.metrics.listClusterUtili(this.cluster)
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
      // updateUtiliData () {
      //   const start = this.utiliData[this.utiliData.length - 1].time
      //   return this.$api.metrics.listClusterUtili(this.cluster, {last: 100, start, step: this.timeStep})
      //     .then(res => {
      //       res.data
      //         .filter(row => row.time > start)
      //         .map(row => {
      //           this.utiliData.push(row)
      //         }
      //       )
      //     })
      //     .catch(err => {
      //       console.log(err)
      //       // this.$NoticeAjaxError(err, '获取使用率数据失败')
      //     })
      // },
      onClickHost (name) {
        const params = {
          ...this.$route.params,
          host: name
        }
        this.$router.push({name: 'monitor-host', params})
      }
    },
    created () {
      this.loadHostData()
      this.loadUtiliData()
    },
    watch: {
      $route () {
        this.loadHostData()
        this.loadUtiliData()
      }
    }
    // beforeDestroy () {
    //   try {
    //     clearInterval(this.timeInterval)
    //   } catch (e) {}
    // }
  }
</script>

<style scoped lang="less">

</style>

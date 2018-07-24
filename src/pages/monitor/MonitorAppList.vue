<template>
  <div>
    <Breadcrumb class="custom-breadcrumb">
      <BreadcrumbItem>监控</BreadcrumbItem>
      <BreadcrumbItem>应用</BreadcrumbItem>
    </Breadcrumb>

    <Tabs type="card" class="custom-tabs">
      <TabPane label="应用列表">
        <div style="margin-bottom: 10px; text-align: right;">
          <i-input v-model="searchText" icon="search" style="width: 200px; margin-right: 5px;"></i-input>
          <Button type="info" icon="refresh" @click="loadAppData">刷新</Button>
        </div>
        <DataTable :columns="cols"
                   :data="appList"
                   :search-text="searchText"
                   :loading="loading"
                   stripe>
        </DataTable>
      </TabPane>
    </Tabs>

  </div>

</template>

<script>
  import {StatusTagFactory} from '@/utils/custom-render'

  export default {
    name: "MonitorAppList",
    props: {
      cluster: String,
      namespace: String
    },
    data () {
      return {
        loading: false,
        appList: [],
        searchText: '',
        cols: [
          {
            key: 'name',
            title: '应用',
            searchable: true,
            sortable: true,
            render: (h, params) => {
              return h(
                'a',
                {
                  on: {
                    click: () => this.onClickApp(params.row.name)
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
            render: StatusTagFactory('status', {0: 'error', 1: 'success'}, {0: '停止', 1: '运行中'})
          },
          {
            key: 'cpu_utili',
            title: 'CPU 使用率',
            render: (h, params) => {
              const value = params.row.cpu_utili * 100
              const text = value.toFixed(0) + '%'
              return [
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
                h('span', `${params.row.cpu_usage} / ${params.row.cpu_request}`)
              ]
            }
          },
          {
            key: 'mem_utili',
            title: '内存使用率',
            render: (h, params) => {
              const value = params.row.mem_utili * 100
              const text = value.toFixed(0) + '%'
              return [
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
                h('span', `${(params.row.mem_usage/1024/1024).toFixed(0)}M / ${(params.row.mem_request/1024/1024).toFixed(0)}M`)
              ]
            }
          },
          {key: 'pod_num', title: 'Pod数量', sortable: true},
        ]
      }
    },
    methods: {
      loadAppData () {
        this.loading = true
        this.$api.metrics.listNamespaceApps(this.cluster, this.namespace)
          .then(res => {
            this.appList = res.data || []
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取应用列表失败')
          })
          .then(() => {
            this.loading = false
          })
      },
      onClickApp (name) {
        const params = {
          ...this.$route.params,
          app: name
        }
        this.$router.push({name: 'monitor-app', params})
      }
    },
    created () {
      this.loadAppData()
    },
    watch: {
      $route () {
        this.loadAppData()
      }
    }
  }
</script>

<style scoped lang="less">

</style>

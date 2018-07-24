<template>
  <div>
    <Breadcrumb class="custom-breadcrumb">
        <BreadcrumbItem>开发</BreadcrumbItem>
        <BreadcrumbItem>编译</BreadcrumbItem>
    </Breadcrumb>

    <div class="page-content-box">
      <div class="table-toolbar">
        <Button type="success" icon="plus-round"
          @click="createPipeline">添加编译</Button>
        <Button type="info" icon="refresh"
                @click="loadData"
                style="float: right;margin-left: 10px;">
          刷新
        </Button>
        <i-input :value="searchText"
                 v-model-debounce:500="searchText"
                 clearable
                 icon="search"
                 style="width: 200px; float: right;">
        </i-input>
      </div>
      <DataTable :columns="cols"
                 size="small"
                 stripe
                 :loading="loading"
                 :search-text="searchText"
                 :data="pipelineList">
      </DataTable>
    </div>
  </div>

</template>

<script>
  import dayjs from 'dayjs'

  export default {
    name: 'pipeline',
    props: {
      cluster: String,
      namespace: String,
    },
    data () {
      return {
        loading: false,
        cols: [
          {
            key: 'name',
            title: '名称',
            searchable: true,
            sortable: true,
            render: (h, params) => {
              return h(
                'a',
                {
                  on: {click: () => this.onClickPipeline(params.row.name)}
                },
                params.row.name
              )
            }
          },
          {key: 'createTime', title: '更新时间', sortable: true},
          {key: 'status', title: '构建状态', searchable: true, sortable: true},
          {
            key: 'name',
            title: '操作',
            render: (h, params) => {
              return [
                h(
                  'Icon',
                  {
                    props: {type: 'ios-play'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => this.runPipeline([params.row.name])
                    }
                }),
                h(
                  'Icon',
                  {
                    props: {type: 'trash-b'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => this.deletePipeline([params.row.name])
                    }
                  })
              ]
            }
          }
        ],
        pipelineList: [],
        loading: false,
        searchText: ''
      }
    },
    methods: {
      getTableDataFromItem (item) {
        return {
          name: item.metadata.name,
          status: _.get(item, 'metadata.labels["pipelines.jd.com/status"]'),
          createTime: dayjs(item.metadata.creationTimestamp).format('YYYY-MM-DD HH:mm:ss')
        }
      },
      loadData () {
        this.loading = true
        const params = {limits: 20}
        this.$api.cluster(this.cluster).listPipelines(this.namespace, {params})
          .then(res => {
            this.pipelineList = res.data.items.map(item => this.getTableDataFromItem(item))
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取流水线列表失败')
          })
          .then(() => {
            this.loading = false
          })
      },
      createPipeline () {
        this.$router.push({
          name: 'pipeline-info',
          params: {
            cluster: this.cluster,
            pipeline: '/'
          }
        })
      },
      onClickPipeline (name) {
        this.$router.push({
          name: 'pipeline-info',
          params: {
            cluster: this.cluster,
            pipeline: name
          }
        })
      },
      deletePipeline (pipelineList) {
        this.$Modal.confirm({
          title: '删除流水线',
          content: '确定要删除流水线吗？',
          loading: true,
          onOk: () => {
            this.$api.cluster(this.cluster).deleteNamespaces(pipelineList)
              .then(res => {
                this.$Message.success('删除成功')
              })
              .catch(err => {
                this.$NoticeAjaxError(err, '删除失败')
              })
              .then(() => {
                this.$Modal.remove()
                setTimeout(() => this.loadData(), 1000)
              })
          }
        })
      }
    },
    mounted () {
      this.loadData()
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

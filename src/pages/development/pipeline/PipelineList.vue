<template>
  <div class="pipeline-panel">
    <Breadcrumb class="custom-breadcrumb">
        <BreadcrumbItem>开发</BreadcrumbItem>
        <BreadcrumbItem>流水线</BreadcrumbItem>
    </Breadcrumb>

    <div class="page-content-box">
    <!-- <div class="content-panel"> -->
      <!-- <iframe src="https://apigw.example.com:8143/jenkins/blue/"></iframe> -->
      <div class="table-toolbar">
        <Button type="success" icon="plus-round"
          @click="createPipeline">添加流水线</Button>
          
        <Button type="default"
                icon="trash-b"
                @click="() => deletePipelines(selectedRows)"
                :disabled="selectedRows.length === 0"
                style="margin-left: 10px;">删除</Button>
        
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
                 :loading="loading"
                 :search-text="searchText"
                 :data="pipelineList"
                 @on-selection-change="selections => selectedRows = selections">
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
        selectedRows: [],
        cols: [
          {type: 'selection', width: 60, align: 'center'},
          {
            key: 't_name',
            title: '名称',
            searchable: true,
            sortable: true,
            render: (h, params) => {
              return h(
                'a',
                {
                  on: {click: () => this.onClickPipeline(params.row.t_name)}
                },
                params.row.t_name
              )
            }
          },
          {key: 't_createTime', title: '更新时间', sortable: true},
          {key: 't_status', title: '构建状态', searchable: true, sortable: true},
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
                      click: () => this.runPipeline([params.row])
                    }
                }),
                h(
                  'Icon',
                  {
                    props: {type: 'trash-b'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => this.deletePipelines([params.row])
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
      loadData () {
        this.loading = true
        // const params = {limits: 20}
        const params = {}
        this.$api.cluster(this.cluster).listPipelines(this.namespace, params)
          .then(res => {
            this.pipelineList = res.data.items.map(item => {
              return _.merge(item, {
                t_name: item.metadata.name,
                t_status: _.get(item, 'metadata.labels["pipelines.jd.com/status"]'),
                t_createTime: dayjs(item.metadata.creationTimestamp).format('YYYY-MM-DD HH:mm:ss')
              })
            })
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
      deletePipelines (rows) {
        let msg = '确定要删除流水线吗？'
        if (rows.length === 1) {
          msg = `确定要删除流水线: ${rows[0].metadata.name} 吗？`
        }
        this.$Modal.confirm({
          title: '删除流水线',
          content: msg,
          loading: true,
          onOk: () => {
            this.$api.cluster(this.cluster).deletePipelines(this.namespace, rows.map(row => row.metadata.name))
              .then(res => {
                this.$Message.success('删除流水线成功')
              })
              .catch(err => {
                this.$NoticeAjaxError(err, '删除流水线失败')
              })
              .then(() => {
                this.$Modal.remove()
                this.loadData()
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
  // .pipeline-panel {
  //   display: flex;
  //   flex-direction: column;
  //   height: 100%;
  // }
  // .content-panel {
  //   flex-grow: 1;
  //   display: flex;
  //   flex-direction: row;
  //   background-color: #fff;
  //   iframe{
  //     width: 100%;
  //     align-self: stretch;
  //     border: 0;
  //   }
  // }
</style>

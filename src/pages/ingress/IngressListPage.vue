<template>
  <div>
    <Breadcrumb class="custom-breadcrumb">
      <BreadcrumbItem>应用</BreadcrumbItem>
      <BreadcrumbItem>路由管理</BreadcrumbItem>
    </Breadcrumb>

    <div class="page-content-box">
      <div class="table-toolbar clearfix">
        <Button type="success" icon="plus" @click="onClickCreate">创建路由</Button>

        <i-input v-model="searchText"
                 placeholder="请输入关键字搜索"
                 icon="search"
                 style="width: 200px; float: right;">
        </i-input>
      </div>

      <DataTable :columns="cols"
                 :data="ingresses"
                 :searchText="searchText"
                 :loading="loading"
                 size="small">
      </DataTable>
    </div>
  </div>
</template>

<script>
  import IngressRules from './IngressRules'

  export default {
    name: 'ingress-list',
    props: {
      cluster: String,
      namespace: String
    },
    data () {
      return {
        ingresses: [],
        loading: true,
        searchText: '',
        cols: [
          {
            title: '路由名称',
            key: 't_name',
            width: 300,
            searchable: true,
            sortable: true
          },
          {
            title: '路由规则',
            key: 't_rules',
            render: (h, params) => {
              return [
                h(IngressRules, {
                  props: {
                    rules: params.row.t_rules
                  }
                })
              ]
            }
          },
          {
            title: '操作',
            key: 't_operation',
            width: 120,
            render: (h, params) => {
              return [
                h(
                  'Icon',
                  {
                    props: {type: 'compose'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => this.modifyIngress(params.row)
                    }
                  }
                ),
                h(
                  'Icon',
                  {
                    props: {type: 'trash-b'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => this.deleteIngress([params.row])
                    }
                  })
              ]
            }
          }
        ]        
      }
    },
    methods: {
      loadData () {
        this.loading = true
        this.$api.cluster(this.cluster).listNamespaceIngresses(this.namespace)
          .then(res => {
            this.loading = false
            this.ingresses = this.getTableData(res.data.items)
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '加载路由列表失败')
          })
      },
      getTableData (data) {
        return data.map(item => {
          return {
            t_name: item.metadata.name,
            t_rules: item.spec.rules
          }
        })
      },
      getServices () {
        return this.$api.cluster(this.cluster).listServices(this.namespace)
          .then(res => {
            this.serviceList = res.data.items
          })
      },
      onClickCreate () {
        this.$router.push({name: 'ingress-create', params: this.$route.params})
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

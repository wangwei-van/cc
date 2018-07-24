<template>
  <div>
    <Breadcrumb class="custom-breadcrumb">
        <BreadcrumbItem>账户</BreadcrumbItem>
        <BreadcrumbItem>我的空间</BreadcrumbItem>
    </Breadcrumb>

    <div class="page-content-box">
      <div class="table-toolbar">
        <Button type="success" icon="plus-round"
          @click="createDialogVisible = true">添加空间</Button>
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
                 :data="namespaceList">
      </DataTable>
    </div>

    <FormDialog :items="createItems"
                v-model="createDialogVisible"
                :label-width="80"
                @submit="handleCreate"
                name="创建空间">
    </FormDialog>

  </div>

</template>

<script>
  import { StatusTagFactory } from '@/utils/custom-render'
  import {DNSNameRule} from '@/utils/validators'

  const createItems = () => [
    {
      type: 'input',
      prop: 'name',
      label: '名称',
      required: true,
      rules: [
        {required: true, message: '请输入名称'},
        DNSNameRule
      ]
    },
    {
      type: 'textarea',
      prop: 'description',
      label: '备注',
      required: false,
      rules: []
    },
    {
      type: 'number',
      prop: 'quotapod',
      label: 'Pod',
      required: false,
      rules: [],
      unit: '个',
      default: 1
    },
    {
      type: 'number',
      prop: 'quotacpu',
      label: 'CPU',
      min: 0,
      max: 100,
      required: false,
      rules: [],
      unit: '个',
      default: 1
    },
    {
      type: 'number',
      prop: 'quotamem',
      label: '内存',
      min: 0,
      max: 999,
      required: false,
      rules: [],
      unit: 'Gi',
      default: 1
    },
    {
      type: 'number',
      prop: 'quotapvc',
      label: '存储卷',
      required: false,
      min: 0,
      rules: [],
      unit: '个',
      default: 1
    },
    {
      type: 'number',
      prop: 'quotastorage',
      label: '存储空间',
      required: false,
      min: 0,
      rules: [],
      unit: 'Gi',
      default: 1
    },
  ]

  export default {
    name: 'user-namespace',
    props: {
      cluster: String
    },
    data () {
      return {
        createDialogVisible: false,
        createItems: createItems(),
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
                  on: {click: () => this.onClickNamespace(params.row.id)}
                },
                params.row.name
              )
            }
          },
          {key: 'description', title: '备注', searchable: true},
          {
            key: 'status',
            title: '状态',
            searchable: false,
            sortable: true,
            render: StatusTagFactory('status', {0: 'warning', 1: 'success'}, {0: '处理中', 1: '已激活'})
          },
          {key: 'createtime', title: '创建时间', sortable: true},
          {
            key: 'name',
            title: '操作',
            render: (h, params) => {
              return [
                h(
                  'Icon',
                  {
                    props: {type: 'trash-b'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => this.deleteNamespace([params.row.id])
                    }
                  })
              ]
            }
          }
        ],
        namespaceList: [],
        currentModifyNamespace: {},
        loading: false,
        searchText: '',
      }
    },
    methods: {
      loadData () {
        this.loading = true
        this.$api.namespace.listNamespace(this.cluster)
          .then(res => {
            // this.namespaceList = res.data.message.map(item => this.getTableDataFromItem(item))
            this.namespaceList = res.data.message
            // this.namespaceList = [{
            //   name: 'xxx',
            //   status: 1
            // }]
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取空间列表失败')
          })
          .then(() => {
            this.loading = false
          })
      },
      onClickNamespace (id) {
        this.$router.push({
          name: 'account-namespace-info',
          params: {
            cluster: this.cluster,
            namespaceId: id.toString()
          }
        })
      },
      deleteNamespace (namespaceIdList) {
        this.$Modal.confirm({
          title: '删除项目空间',
          content: '<p>确定要删除项目空间吗？</p>',
          loading: true,
          onOk: () => {
            this.$api.namespace.deleteNamespaces(namespaceIdList)
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
      },
      handleCreate (formData) {
        // todo: 单位
        const jsonData = {
          cluster: this.cluster,
          ...formData
        }
        jsonData.quotamem += 'Gi'
        jsonData.quotastorage += 'Gi'

        this.$api.namespace.createNamespace(jsonData)
          .then(res => {
            this.$Message.success('创建成功')
            this.loadData()
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '创建权限项失败')
          })
          .then(() => {
            this.createDialogVisible = false
            this.loadData()
          })
      },
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

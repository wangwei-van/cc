<template>
  <div>
    <Breadcrumb class="custom-breadcrumb">
        <BreadcrumbItem>项目</BreadcrumbItem>
        <BreadcrumbItem>空间管理</BreadcrumbItem>
    </Breadcrumb>

    <div class="page-content-box">
      <div class="table-toolbar">
        <Button type="success" icon="plus-round"
          @click="createDialogVisible = true">添加空间</Button>
        <ButtonGroup>
          <Button :class="{'ivu-btn-info': type==='all'}" @click="changeType('all')" style="width:80px">所有</Button>
          <Button :class="{'ivu-btn-info': type==='unhandled'}" @click="changeType('unhandled')" style="width:80px">待审批</Button>
          <Button :class="{'ivu-btn-info': type==='handled'}" @click="changeType('handled')" style="width:80px">已审批</Button>
        </ButtonGroup>

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
        type: 'all',
        createDialogVisible: false,
        createItems: createItems(),
        loading: false,
        cols: [
          {
            key: 'namespacename',
            title: '名称',
            searchable: true,
            sortable: true,
            render: (h, params) => {
              return h(
                'a',
                {
                  on: {click: () => this.onClickNamespace(params.row.namespaceid)}
                },
                params.row.namespacename
              )
            }
          },
          {key: 'description', title: '备注', searchable: true},
          {key: 'createuser', title: '创建用户', searchable: true},
          {
            key: 'status',
            title: '状态',
            searchable: false,
            sortable: true,
            render: StatusTagFactory('action', {Submit: 'warning', Approved: 'success', Declined: 'error'}, {Submit: '审批中', Approved: '审批通过', Declined: '审批不通过'})
          },
          {key: 'createtime', title: '创建时间', sortable: true},
          {
            key: 'name',
            title: '操作',
            render: (h, params) => {
              const deleteIcon = h('Icon', {
                props: {type: 'trash-b'},
                class: {'table-tool-icon': true},
                nativeOn: {
                  click: () => this.deleteNamespace([params.row.namespaceid])
                }
              })
              const approveIcon = h('Icon', {
                props: {type: 'ios-checkmark-outline'},
                class: {'table-tool-icon': true},
                nativeOn: {
                  click: () => this.handleApprove(params.row.id, true)
                }
              })
              const moreIcon = h('TableDropdown', {
                props: {
                  items: [
                    {iconType: 'ios-close-outline', text: '不通过', callback: this.handleApprove, params: [params.row.id, false]}
                  ]
                }
              })
              if (params.row.action === 'Submit') {
                return [deleteIcon, approveIcon, moreIcon]
              } else {
                return [deleteIcon]
              }
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
        this.$api.namespace.listNamespace(this.cluster, 'operation')
          .then(res => {
            const filterData = _.filter(res.data.message, item => item.approvals && item.approvals.id !== 0)
            this.namespaceList = _.map(filterData, item => 
              _.merge({}, item.approvals, {
                createuser: item.namespace.createuser,
                createtime: item.namespace.createtime
              })
            )
            this.initNamespaceList = _.cloneDeep(this.namespaceList)
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取空间列表失败')
          })
          .then(() => {
            this.loading = false
          })
      },
      changeType (type) {
        this.type = type
        if (type === 'all') {
          this.namespaceList = _.cloneDeep(this.initNamespaceList)
        } else if (type === 'unhandled') {
          this.namespaceList = _.filter(this.initNamespaceList, item => item.action === 'Submit')
        } else {
          this.namespaceList = _.filter(this.initNamespaceList, item => item.action !== 'Submit')
        }
      },
      onClickNamespace (id) {
        this.$router.push({
          name: 'namespace-info',
          params: {
            cluster: this.cluster,
            namespaceId: id.toString()
          }
        })
      },
      handleApprove (namespaceId, isApproved) {
        this.$api.namespace.modifyNsApproval(namespaceId, {approved: isApproved})
          .then(res => {
            this.loadData()
            this.$Message.success('审批成功')
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

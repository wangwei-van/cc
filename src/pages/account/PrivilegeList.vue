i<template>
  <div>
    <div :style="{margin: '10px 0'}">
      <Button type="success" @click="createDialogVisible = true">添加权限项</Button>
      <i-input :value="searchText"
               v-model-debounce:500="searchText"
               clearable
               icon="search"
               style="width: 200px; float: right;">
      </i-input>
      <!--@input="onSearchInput"-->
    </div>
    <div>
      <DataTable :columns="cols"
                 :search-text="searchText"
                 :data="privilegeList">
      </DataTable>

    </div>
    <FormDialog :items="createItems"
                v-model="createDialogVisible"
                :label-width="80"
                @submit="handleCreate"
                name="创建权限项">
    </FormDialog>

    <FormDialog :items="modifyItems"
                v-model="modifyDialogVisible"
                :label-width="80"
                :init-data="currentModifyPrivilege"
                @submit="handleModify"
                name="修改权限项">
    </FormDialog>

  </div>

</template>

<script>
  import {TagList} from '@/utils/custom-render'

  const createItems = () => [
    {
      type: 'input',
      prop: 'name',
      label: '权限项名',
      required: true,
      rules: []
    },
    {
      type: 'select',
      prop: 'action',
      label: 'Action',
      required: true,
      options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      multiple: true,
      rules: []
    },
    {
      type: 'input',
      prop: 'resource',
      label: '资源',
      required: true,
      rules: []
    },
    {
      type: 'textarea',
      prop: 'description',
      label: '描述',
      required: true,
      rules: []
    }
  ]

  const modifyItems = () => {
    const items = createItems()
    items[0].disabled = true
    return items
  }

  export default {
    name: 'user-privilege',
    data () {
      return {
        createDialogVisible: false,
        createItems: createItems(),
        modifyItems: modifyItems(),
        cols: [
          {key: 'name', title: '权限项', searchable: true},
          {key: 'description', title: '描述', searchable: true},
          {
            key: 'action',
            title: 'Action',
            searchable: true,
            render: TagList('action', {
              'GET': 'info',
              'POST': 'success',
              'PUT': 'warning',
              'PATCH': 'warning',
              'DELETE': 'error'
            })
          },
          {key: 'resource', title: '资源', searchable: true},
          {
            key: 'name',
            title: '操作',
            render: (h, params) => {
              return [
                 h(
                  'Icon',
                  {
                    props: {type: 'compose'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => this.onClickModifyPrivilege(params.row)
                    }
                  }
                ),
                h(
                  'Icon',
                  {
                    props: {type: 'trash-b'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => this.deletePrivilege([params.row.id])
                    }
                  })
              ]
            }
          }
        ],
        privilegeList: [],
        modifyDialogVisible: false,
        currentModifyPrivilege: {},
        loading: false,
        searchText: ''
      }
    },
    methods: {
      loadData () {
        this.loading = true
        this.$api.user.listPrivileges()
          .then(res => {
            this.privilegeList = res.data.message.map(item => {
              if (item.action.length === 0) {
                item.action = []
              } else {
                item.action = item.action.split(',')
              }
              return item
            })
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取权限项失败')
          })
          .then(() => {
            this.loading = false
          })
      },
      onClickModifyPrivilege (privilege) {
        this.currentModifyPrivilege = privilege
        this.modifyDialogVisible = true
      },
      deletePrivilege (privilegeIds) {
        this.$Modal.confirm({
          title: '删除权限项',
          content: '确定要删除该权限项吗？',
          loading: true,
          onOk: () => {
            this.$api.user.deletePrivileges(privilegeIds)
              .then(res => {
                this.$Message.success('删除成功')
              })
              .catch(err => {
                this.$NoticeAjaxError(err, '删除失败')
              })
              .then(() => {
                this.$Modal.remove()
                this.loadData()
              })
          }
        })
      },
      handleCreate (formData) {
        this.$api.user.createPrivilege(formData)
          .then(res => {
            this.$Message.success('创建成功')
            this.loadData()
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '创建权限项失败')
          })
          .then(() => {
            this.createDialogVisible = false
          })
      },
      handleModify (formData) {
        this.$api.user.modifyPrivilege(formData)
          .then(res => {
            this.$Message.success('修改成功')
          })
          .catch(err => {this.$NoticeAjaxError(err, '修改权限项失败')})
          .then(() => {
            this.loadData()
            this.modifyDialogVisible = false
          })
      },
      onSearchInput: _.debounce(
        function (newVal) {
          this.searchText = newVal
        }, 500)
    },
    mounted () {
      this.loadData()
    }
  }
</script>

<style lang="less" scoped>

</style>

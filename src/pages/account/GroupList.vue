<template>
  <div>
    <div :style="{margin: '10px 0'}">
      <Button type="success" @click="createDialogVisible = true">添加用户组</Button>
    </div>
    <div>
      <DataTable :columns="cols"
                 :data="groupList">
      </DataTable>

    </div>
    <FormDialog :items="createItems"
                v-model="createDialogVisible"
                :label-width="80"
                @submit="handleCreate"
                name="创建用户组">
    </FormDialog>
    <ModifyGroupDialog v-model="modifyDialogVisible"
                       :init-data="currentModifyGroup"
                       @submit="handleModify">
    </ModifyGroupDialog>
  </div>

</template>

<script>
  import {TagList} from '@/utils/custom-render'
  import ModifyGroupDialog from './ModifyGroupDialog'
  import _ from 'lodash'

  export default {
    name: 'user-group',
    components: { ModifyGroupDialog },
    data () {
      return {
        createDialogVisible: false,
        createItems: [
          {
            type: 'input',
            prop: 'name',
            label: '用户组名',
            required: true,
            rules: []
          },
          {
            type: 'textarea',
            prop: 'description',
            label: '描述',
            required: false,
            rules: []
          }
        ],
        cols: [
          {key: 'name', title: '用户组'},
          {key: 'description', title: '描述'},
          {key: 'users', title: '成员', render: TagList('users')},
          {key: 'roles', title: '角色', render: TagList('roles')},
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
                      click: () => this.onClickModifyGroup(params.row)
                    }
                  }
                ),
                h(
                  'Icon',
                  {
                    props: {type: 'trash-b'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => this.deleteGroup([params.row.id])
                    }
                  })
              ]
            }
          }
        ],
        groupList: [],
        modifyDialogVisible: false,
        loading: false,
        currentModifyGroup: {}
      }
    },
    methods: {
      loadData () {
        this.loading = true
        this.$api.user.listGroups()
          .then(res => {
            this.groupList = res.data.message.map(row => _.merge(row.group, _.pick(row, ['roles', 'users'])))
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取用户组失败')
          })
          .then(() => {
            this.loading = false
          })

      },
      onClickModifyGroup (group) {
        this.currentModifyGroup = group
        this.modifyDialogVisible = true
      },
      deleteGroup (groupIds) {
        this.$Modal.confirm({
          title: '删除用户组',
          content: '确定要删除该用户组吗？',
          loading: true,
          onOk: () => {
            this.$api.user.deleteGroups(groupIds)
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
        this.$api.user.createGroup(formData)
          .then(res => {
            this.$Message.success('创建成功')
            this.loadData()
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '创建用户组失败')
          })
          .then(() => {
            this.createDialogVisible = false
          })
      },
      handleModify (formData) {
        this.$api.user.modifyGroup(formData)
          .then(res => {
            this.$Message.success('修改成功')
          })
          .catch(err => {this.$NoticeAjaxError(err, '修改用户组失败')})
          .then(() => {
            this.loadData()
            this.modifyDialogVisible = false
          })
      }
    },
    mounted () {
      this.loadData()
    }
  }
</script>

<style lang="less" scoped>

</style>

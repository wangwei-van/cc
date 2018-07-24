<template>
  <div>
    <div :style="{margin: '10px 0'}">
      <Button type="success" @click="createDialogVisible = true">添加角色</Button>
    </div>
    <div>
      <DataTable :columns="cols"
                 :data="roleList">
      </DataTable>

    </div>
    <FormDialog :items="createItems"
                v-model="createDialogVisible"
                :label-width="80"
                @submit="handleCreate"
                name="创建角色">
    </FormDialog>
    <ModifyRoleDialog v-model="modifyDialogVisible"
                       :init-data="currentModifyRole"
                       @submit="handleModify">
    </ModifyRoleDialog>
  </div>

</template>

<script>
  import {TagList} from '@/utils/custom-render'
  import ModifyRoleDialog from './ModifyRoleDialog'
  import _ from 'lodash'

  export default {
    name: 'user-role',
    components: { ModifyRoleDialog },
    data () {
      return {
        createDialogVisible: false,
        createItems: [
          {
            type: 'input',
            prop: 'name',
            label: '角色名',
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
          {key: 'name', title: '角色'},
          {key: 'description', title: '描述'},
          {key: 'privileges', title: '权限项', render: TagList('privileges')},
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
                      click: () => this.onClickModifyRole(params.row)
                    }
                  }
                ),
                h(
                  'Icon',
                  {
                    props: {type: 'trash-b'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => this.deleteRole([params.row.id])
                    }
                  })
              ]
            }
          }
        ],
        roleList: [],
        modifyDialogVisible: false,
        loading: false,
        currentModifyRole: {}
      }
    },
    methods: {
      loadData () {
        this.loading = true
        this.$api.user.listRoles()
          .then(res => {
            this.roleList = res.data.message.map(row => _.merge(row.role, {privileges: row.privileges}))
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取角色失败')
          })
          .then(() => {
            this.loading = false
          })
      },
      onClickModifyRole (role) {
        this.currentModifyRole = role
        this.modifyDialogVisible = true
      },
      deleteRole (roleIds) {
        this.$Modal.confirm({
          title: '删除角色',
          content: '确定要删除该角色吗？',
          loading: true,
          onOk: () => {
            this.$api.user.deleteRoles(roleIds)
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
        this.$api.user.createRole(formData)
          .then(res => {
            this.$Message.success('创建成功')
            this.loadData()
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '创建角色失败')
          })
          .then(() => {
            this.createDialogVisible = false
          })
      },
      handleModify (formData) {
        this.$api.user.modifyRole(formData)
          .then(res => {
            this.$Message.success('修改成功')
          })
          .catch(err => {this.$NoticeAjaxError(err, '修改角色失败')})
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

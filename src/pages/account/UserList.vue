<template>
  <div>
    <div :style="{margin: '10px 0'}">
      <Button type="success" icon="person-add" @click="createDialogVisible = true">创建用户</Button>
    </div>
    <DataTable :columns="cols" :data="userList"></DataTable>
    <FormDialog :items="createItems"
                v-model="createDialogVisible"
                name="创建用户"
                :label-width="80"
                @submit="handleCreate">
    </FormDialog>
    <ModifyUserDialog v-model="modifyDialogVisible"
                      :init-data="modifyUserInfo"
                      @submit="handleModify">
    </ModifyUserDialog>

  </div>

</template>

<script>
  import ModifyUserDialog from './ModifyUserDialog'
  import { TagList } from '@/utils/custom-render'

  export default {
    name: 'user-list',
    props: {},
    components: { ModifyUserDialog },
    data () {
      return {
        cols: [
          {key: 'name', title: '用户名'},
          {key: 'description', title: '描述'},
          {key: 'mail', title: '邮箱'},
          {key: 'groups', title: '组', render: TagList('groups')},
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
                      click: () => this.modifyUser(params.row)
                    }
                  }
                ),
                h(
                  'Icon',
                  {
                    props: {type: 'trash-b'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => this.deleteUser([params.row.name])
                    }
                  })
              ]
            }
          },
        ],
        userList: [],
        loading: false,
        createItems: [
          {
            type: 'input',
            prop: 'name',
            label: '用户名',
            required: true,
            rules: []
          },
          {
            type: 'password',
            prop: 'password',
            label: '密码',
            required: true,
            rules: []
          },
          {
            type: 'password',
            prop: 'password_ensure',
            label: '确认密码',
            required: true,
            rules: [{
              validator (rule, value, callback) {
                let errors = []
                if (this.form.password !== value) {
                  errors.push(new Error('密码不相同'))
                }
                callback(errors)
              }
            }]
          },
          {
            type: 'email',
            prop: 'mail',
            label: '邮件地址',
            required: true,
            rules: []
          },
          {
            type: 'textarea',
            prop: 'description',
            label: '描述',
            required: false,
            rules: []
          },
        ],
        createDialogVisible: false,
        modifyDialogVisible: false,
        modifyUserInfo: {}
      }
    },
    methods: {
      loadData () {
        this.loading = true
        this.$api.user.listAllUsers()
          .then(res => {
            this.userList = res.data.message.map(row => {
              const data = row.user
              data.groups = row.groups
              data.roles = row.roles
              return data
            })
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取用户列表失败')
          })
          .then(() => {
            this.loading = false
          })
      },
      handleCreate (formData) {
        this.$api.user.createUser(formData)
          .then(res => {
            this.$Message.success('创建用户成功')
            this.loadData()
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '创建用户失败')
          })
          .then(() => {
            this.createDialogVisible = false
          })
      },
      modifyUser (userInfo) {
        this.modifyUserInfo = userInfo
        this.modifyDialogVisible = true
      },
      handleModify (formData) {
        this.$api.user.modifyUser(formData.name, formData)
          .then(res => {
            this.$Message.success('修改用户成功')
            this.loadData()
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '修改用户失败')
          })
          .then(() => {
            this.modifyDialogVisible = false
          })
      },
      deleteUser (names) {
        this.$Modal.confirm({
          title: '删除用户',
          content: '确定要删除该用户吗？',
          loading: true,
          onOk: () => {
            this.$api.user.deleteUsers(names)
              .then(res => {
                this.$Message.success('删除用户成功')
              })
              .catch(err => {
                this.$NoticeAjaxError(err, '删除用户失败')
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
    }
  }
</script>

<style lang="less" scoped>

</style>

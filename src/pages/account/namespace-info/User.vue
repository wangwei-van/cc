<template>
  <div>
    <div :style="{margin: '10px 0', height: '32px'}">
      <Button v-if="isAdmin" type="success" icon="person-add" @click="onClickAddUser">邀请</Button>
      <Button v-if="isAdmin"
              type="default"
              icon="trash-a"
              @click="onClickRemoveSelected"
              style="margin-left: 5px;"
              :disabled="selectedRows.length === 0">移除</Button>
      <!--<Button v-if="isAdmin" type="error" icon="person-add" class="right-btn" @click="handleRemoveAll">解散</Button>-->
      <Button v-if="!isAdmin" type="error" icon="log-out" class="right-btn" @click="handleEsc">退出</Button>
    </div>
    <DataTable :columns="cols"
               :data="userList"
               :loading="loading"
               @on-selection-change="selection => selectedRows = selection">
    </DataTable>
    <AddNamespaceUserDialog v-model="addUserDialogVisible"
                            @submit="handleAddUser">
    </AddNamespaceUserDialog>
  </div>

</template>

<script>
  import AddNamespaceUserDialog from './AddNamespaceUserDialog'

  export default {
    name: 'user',
    components: { AddNamespaceUserDialog },
    props: {
      cluster: String,
      namespaceId: String
    },
    computed: {
      isAdmin () {
        return true
      }
    },
    data () {
      return {
        cols: [
          {type: 'selection', width: 60, align: 'center'},
          {title: '用户名', key: 'username'},
          {
            title: '角色',
            key: 'userrole',
            render: (h, params) => {
              if (this.isAdmin && params.row.username !== this.$store.state.username) {
                return h(
                  'DropdownSelect',
                  {
                    props: {
                      value: params.row.userrole,
                      options: ['admin', 'edit', 'view'],
                      loading: true,
                    },
                    on: {
                      'on-change': role => this.onRoleChange(params.row.username, role)
                    }
                  }
                )
              } else {
                return h('span', params.row.userrole)
              }
            }
          },
          {
            title: '操作',
            key: 'username',
            width: 100,
            render: (h, params) => {
              if (!this.isAdmin) return
              if (this.$store.state.username === params.row.username) return
              return h(
                'Icon',
                {
                  props: {
                    type: 'trash-a'
                  },
                  class: {
                    'table-tool-icon': true
                  },
                  nativeOn: {
                    click: () => {
                      this.handleRemove([params.row.username])
                    }
                  }
                },
              )
            }
          },
        ],
        userList: [],
        selectedRows: [],
        addUserDialogVisible: false,
        loading: false,
      }
    },
    methods: {
      loadData () {
        this.loading = true
        this.$api.namespace.listNamespaceUsers(this.namespaceId)
          .then(res => {
            this.userList = res.data.message
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取用户列表失败')
          })
          .then(() => {
            this.loading = false
          })
      },
      onClickAddUser () {
        this.addUserDialogVisible = true
      },
      handleAddUser (submitFormData) {
        const formData = {
          namespaceid: parseInt(this.namespaceId),
          ...submitFormData
        }
        this.$api.namespace.addNamespaceUser(formData)
          .then(res => {
            this.$Message.success('添加成功')
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '添加失败')
          })
          .then(() => {
            this.addUserDialogVisible = false
            this.loadData()
          })
      },
      onClickRemoveSelected () {
        this.handleRemove(this.selectedRows.map(item => item.username))
      },
      handleRemove (usernames) {
        // todo: 删除自己
        this.$Modal.confirm({
          title: '删除用户',
          content: '<p>确定要将用户移除吗？</p>',
          loading: true,
          onOk: () => {
            this.$api.namespace.removeNamespaceUser(usernames, parseInt(this.namespaceId), this.cluster)
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
      handleRemoveAll () {
        this.$Modal.confirm({
          title: '解散用户',
          content: '<p>确定要解散用户吗？</p>',
          loading: true,
          onOk: () => {
            this.$api.namespace.removeNamespaceUser(usernames, parseInt(this.namespaceId), this.cluster)
              .then(res => {
                this.$Message.success('删除成功')
                this.loadData()
              })
              .catch(err => {
                this.$NoticeAjaxError(err, '删除失败')
              })
              .then(() => {
                this.$Modal.remove()
              })
          }
        })
      },
      handleEsc () {
        this.$Modal.confirm({
          title: '退出空间',
          content: '<p>确定要退出该空间吗？</p>',
          loading: true,
          onOk: () => {
            this.$api.namespace.removeNamespaceUser([this.$store.state.username], parseInt(this.namespaceId), this.cluster)
              .then(res => {
                this.$Message.success('退出成功')
                // 成功后跳转
                this.$router.push({name: 'namespace-list', params: this.$route.params})
              })
              .catch(err => {
                this.$NoticeAjaxError(err, '退出失败')
              })
              .then(() => {
                this.$Modal.remove()
              })
          }
        })
      },
      onRoleChange (username, role) {
        this.$api.namespace.setUserNamespaceRole(username, parseInt(this.namespaceId), role)
          .then(res => {
            this.loadData()
          })
          .catch(err => {
            this.loadData()
            this.$NoticeAjaxError(err, '修改用户角色失败')
          })
      }
    },
    mounted () {
      this.loadData()
    }
  }
</script>

<style lang="less" scoped>
  .right-btn {
    float: right;
    margin-left: 5px;
  }

</style>

<template>
  <Modal :value="value" @input="val => $emit('input', val)"
         :mask-closable="false"
         @on-visible-change="onVisibleChange" title="添加用户">
    <Form :model="form" :rules="addRules" :label-width="80" style="padding-right: 30px;" ref="form">
      <FormItem label="用户名" prop="username">
        <AutoComplete v-model="form.username" :data="userData" @on-search="onUserSearch"></AutoComplete>
      </FormItem>
      <FormItem label="角色" prop="userrole">
        <Select v-model="form.userrole">
          <Option v-for="item in roles" :key="item" :value="item">{{item}}</Option>
        </Select>
      </FormItem>
    </Form>
    <div slot="footer" class="dialog-footer">
      <Button type="text" @click="$emit('input', false)">取 消</Button>
      <Button type="primary" @click="onSubmitAddUser" :loading="loading">确 定</Button>
    </div>
  </Modal>
</template>

<script>

  export default {
    name: 'add-namespace-user-dialog',
    props: {
      value: Boolean
    },
    data () {
      return {
        form: {},
        addRules: {
          username: [
            {required: true, message: '用户名不能为空'}
          ],
          userrole: [
            {required: true, message: '请选择角色'}
          ]
        },
        userData: [],
        allUsers: [],
        loading: false,
        roles: ['admin', 'edit', 'view']
      }
    },
    methods: {
      loadAllUsers () {
        if (this.allUsers.length > 0) return
        this.$api.user.listAllUsers()
          .then(res => {
            this.allUsers = res.data.message.map(item => item.user.name)
          })
      },
      onUserSearch (value) {
        this.userData = this.allUsers.filter(name => _.includes(name, value))
      },
      onSubmitAddUser () {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.loading = true
            this.$emit('submit', {...this.form})
          }
        })
      },
      onVisibleChange (visible) {
        if (visible) {
          this.loadAllUsers()
        } else {
          this.form = {}
          this.loading = false
          this.$refs.form.resetFields()
        }
      }
    }
  }
</script>

<style lang="less" scoped>

</style>

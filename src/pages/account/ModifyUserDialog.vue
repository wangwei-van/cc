<template>
  <Modal title="修改用户"
         v-model="visible"
         :mask-closable="false"
         class="form-dialog"
         width="600px"
         ref="dialog">
    <Form :model="form" :rules="rules" ref="form" style="padding-right: 30px;">
      <FormItem label="用户名" prop="name" :label-width="formLabelWidth">
        <i-input v-model="form.name" disabled></i-input>
      </FormItem>
      <FormItem label="邮箱地址" prop="mail" :label-width="formLabelWidth">
        <i-input v-model="form.mail" ></i-input>
      </FormItem>
      <FormItem label="描述" prop="description" :label-width="formLabelWidth">
        <i-input v-model="form.description" type="textarea"></i-input>
      </FormItem>
      <FormItem label="角色" prop="roles" :label-width="formLabelWidth">
        <Select v-model="form.roles" filterable multiple>
          <Option v-for="role in roleList"
                  :key="role.role.id"
                  :value="role.role.id">
            {{role.role.name}}
          </Option>
        </Select>
      </FormItem>
    </Form>
    <div slot="footer" class="dialog-footer">
      <Button type="text" @click="visible = false">取 消</Button>
      <Button type="primary" @click="submit" :loading="loading">确 定</Button>
    </div>
  </Modal>
</template>

<script type="text/ecmascript-6">
  /*
  submit: {
    mail: '',
    description: '',
    roles: [1,2,3],
    oldRoles: [2,3,4]
  }
   */


  import _ from 'lodash'

  export default {
    name: 'modify-user-dialog',
    props: {
      value: {
        type: Boolean,
        default: false
      },
      initData: {
        type: Object,
        required: false
      },
    },
    data () {
      return {
        visible: this.value,
        loading: false,
        formLabelWidth: 80,
        form: this.getInitFormData(),
        rules: {
          mail: [
            {required: true, message: '请输入邮箱'}
          ],
        },
        roleList: []
      }
    },
    methods: {
      loadData () {
        this.$api.user.listUserRoles(this.initData.name)
          .then(res => {
            const ids = res.data.message.map(row => row.roleid)
            this.form.roles = [...ids]
            this.form.oldRoles = [...ids]
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取用户的角色列表失败')
          })

        this.$api.user.listRoles()
          .then(res => {
            this.roleList = res.data.message
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取角色列表失败')
          })
      },
      getInitFormData () {
        let output = {}
        console.log(this.initData)
        if (this.initData) {
          output = _.pick(this.initData, ['name', 'mail', 'description'])
        }
        output.roles = []
        return output
      },
      submit () {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.loading = true
            this.$emit('submit', this.form)
          } else {
            return false
          }
        })
      },
      clearForm () {
        this.form = this.getInitFormData()
        this.loading = false
        if (this.$refs.form) this.$refs.form.resetFields()
      }
    },
    watch: {
      value (newVal) {
        this.visible = newVal
        if (!newVal) {
          this.clearForm()
        } else {
          this.loadData()
        }
      },
      visible (newVal) {
        this.$emit('input', newVal)
      },
      initData () {
        this.form = this.getInitFormData()
      }
    }
  }
</script>

<style lang="less" scoped>


</style>

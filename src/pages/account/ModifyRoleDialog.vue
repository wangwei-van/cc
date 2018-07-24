<template>
  <Modal title="修改角色"
         v-model="visible"
         :mask-closable="false"
         class="form-dialog"
         width="600px"
         ref="dialog">
    <Form :model="form" :rules="rules" ref="form" style="padding-right: 30px;">
      <FormItem label="角色名" prop="name" :label-width="formLabelWidth">
        <i-input v-model="form.name" disabled></i-input>
      </FormItem>
      <FormItem label="描述" prop="description" :label-width="formLabelWidth">
        <i-input v-model="form.description" type="textarea"></i-input>
      </FormItem>
      <FormItem label="权限项" prop="privileges" :label-width="formLabelWidth">
        <Select v-model="form.privileges" filterable multiple>
          <Option v-for="item in privilegeList"
                  :key="item.id"
                  :value="item.id">
            {{item.name}}
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
    name: '',
    description: '',
    roles: [1,2,3],
    oldRoles: [2,3,4]
  }
   */
  import _ from 'lodash'

  export default {
    name: 'modify-role-dialog',
    props: {
      value: {
        type: Boolean,
        default: false
      },
      initData: {
        type: Object,
        required: () => ({})
      },
    },
    data () {
      return {
        visible: this.value,
        loading: false,
        formLabelWidth: 80,
        form: this.getInitFormData(),
        rules: {
          description: []
        },
        privilegeList: [],
      }
    },
    methods: {
      loadData () {
        this.$api.user.listRolePrivileges(this.initData.id)
          .then(res => {
            const ids = res.data.message.map(row => row.privilegeid)
            this.form.privileges = ids
            this.form.oldPrivileges = [...ids]
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取角色的角色列表失败')
          })

        this.$api.user.listPrivileges()
          .then(res => {
            this.privilegeList = res.data.message
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取权限项列表失败')
          })
      },
      getInitFormData () {
        let output = {}
        if (this.initData) {
          output = _.pick(this.initData, ['id', 'name', 'description'])
        }
        output.privileges = []
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

<template>
  <Modal :title="name"
         v-model="visible"
         :mask-closable="false"
         class="form-dialog"
         width="600px"
         ref="dialog">
    <Form :model="form" :rules="rules" ref="form" style="padding-right: 35px;">

      <FormItem v-for="item in items"
                class="form-item"
                :key="item.prop"
                :label="item.label || item.prop"
                :prop="item.prop"
                :label-width="formLabelWidth"
                :required="item.required === undefined ? true : item.required">

        <Select v-if="item.type === 'select' "
                v-model="form[item.prop]"
                :filterable="item.filterable"
                :multiple="item.multiple"
                :disabled="item.disabled"
                placeholder="请选择"
                transfer>
          <Option v-for="opt in item.options"
                  :key="opt.value || opt"
                  :value="opt.value || opt">
            {{opt.label || opt}}
          </Option>
        </Select>

        <i-input v-else-if="item.type === 'input' "
                 :disabled="item.disabled"
                 v-model="form[item.prop]"
                 placeholder="请输入">
        </i-input>

        <i-input v-else-if="item.type === 'textarea' || item.type === 'password' || item.type === 'email'"
                 :type="item.type"
                 :disabled="item.disabled"
                 v-model="form[item.prop]"
                 placeholder="请输入">
        </i-input>

        <input-number v-else-if="item.type === 'number'"
                      v-model="form[item.prop]"
                      :min="item.min === undefined ? -Infinity : item.min"
                      :max="item.max === undefined ? Infinity : item.max"
                      :step="item.step || 1"
                      :disabled="item.disabled"
                      style="width: 100%;">
        </input-number>
        <span class="item-unit" v-if="item.unit">{{item.unit}}</span>

      </FormItem>
      <slot name="extra-item"></slot>

    </Form>
    <div slot="footer" class="dialog-footer">
      <Button type="text" @click="visible = false">取 消</Button>
      <Button type="primary" @click="submit" :loading="loading">确 定</Button>
    </div>
  </Modal>
</template>

<script type="text/ecmascript-6">
  import _ from 'lodash'
  /**
   * @prop: items [
   * {
   *  type: 'input/select/email/textarea/password/date',
   *  label: '名称',
   *  prop: 'name',
   *  required: true/false,
   *  multiple: false/true,
   *  filterable: false/true,
   *  disabled: false/true
   *  options: [{
   *    {label: 'A1', value: 'a1'},
   *    {label: 'A2', value: 'a2'},
   *    }, ...], 或者 ['True', 'False']
   *  rules: [{}, ...],
   *  default: optional, //need to add
   *  unit: '显示单位'
   *  }
   *]
   * @prop: value // visible
   * @prop: name  // 标题
   * @prop: initData // 表单初始化数据
   * @prop: labelWidth: Number  // 表单参数名长度
   */

  export default {
    name: 'form-dialog',
    props: {
      value: {
        type: Boolean,
        default: false
      },
      items: {
        type: Array,
        required: true
      },
      name: String,
      initData: {
        type: Object,
        required: false
      },
      labelWidth: {
        type: Number,
        required: false
      },

    },
    data () {
      return {
        visible: this.value,
        loading: false,
        formLabelWidth: this.getLabelWidth(),
        form: this.getInitFormData(),
        rules: this.getRules()
      }
    },
    methods: {
      getInitFormData () {
        const formData = _.zipObject(
          this.items.map(row => row.prop),
          this.items.map(row => {
            if (row.default) {
              if (typeof(row.default) === 'function') {
                return row.default()
              }
              return row.default
            }
            if (row.type === 'select') {
              return row.multiple ? [] : ''
            } else {
              return ''
            }
          })
        )
        if (this.initData) {
          return _.merge(formData, this.initData)
        }
        return formData
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
      },
      getRules () {
        let rules = {}
        for (let item of this.items) {
          if (item.rules) {
            rules[item.prop] = item.rules
            // 如果 rule 有validator，把form注入进去, 作为this使用
            rules[item.prop].map(rule => {
              if (rule.validator) {
                rule.validator = _.bind(rule.validator, this)
              }
            })
          } else {
            rules[item.prop] = []
          }
          if (item.required) {
            rules[item.prop].splice(0, 0, {required: true, message: '请输入' + item.label})
          }
        }
        return rules
      },
      getLabelWidth () {
        if (this.labelWidth) return this.labelWidth
        return (_(this.items).map(item => item.label.length).max() + 1 ) * 10
      }
    },
    watch: {
      value (newVal) {
        this.visible = newVal
        if (!newVal) this.clearForm()
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
  .form-item {
    white-space: nowrap;
  }

  .item-unit {
    color: grey;
    margin-left: 3px;
  }

</style>

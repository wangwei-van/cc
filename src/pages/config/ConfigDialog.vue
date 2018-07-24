<template>
  <Modal title="创建配置" width="800px"
         :value="value"
         :mask-closable="false"
         @input="$emit('input', false)"
         @on-visible-change="clearForm"
         >
    <Form :model="form" :label-width="80" label-position="left" :rules="rules" ref="form">
      <FormItem label="名称" prop="name">
        <i-input v-model="form.name" :disabled="type === 'modify'"></i-input>
      </FormItem>
      <FormItem label="类型">
        <RadioGroup v-model="form.type">
          <Radio label="configmap" :disabled="type === 'modify'">配置集</Radio>
          <Radio label="secret" :disabled="type === 'modify'">秘钥集</Radio>
        </RadioGroup>
      </FormItem>
      <ConfigPars v-model="form.config_pars" @on-change="validateField('config_pars')" v-if="value"></ConfigPars>
      <FormItem prop="config_pars" :label-width="1"></FormItem>
    </Form>
    <div slot="footer" class="dialog-footer">
      <Button type="text" @click="$emit('input', false)">取 消</Button>
      <Button type="primary" @click="submit" :loading="loading">确 定</Button>
    </div>
  </Modal>
</template>

<script>
  import _ from 'lodash'
  import ConfigPars from './ConfigPars'
  import {parsValidator} from '@/utils/validators'
  import {DNSNameRule} from '@/utils/validators'

  export default {
    name: 'config-dialog',
    components: {ConfigPars},
    props: {
      value: {
        type: Boolean,
        default: false
      },
      initData: {
        type: Object,
        default: () => {}
      },
    },
    data () {
      return {
        loading: false,
        form: this.getInitFormData(),
        type: 'create',
        rules: {
          name: [
            {type: 'string', required: true, message: '名称不能为空'},
            DNSNameRule
          ],
          config_pars: [
            { validator: parsValidator, trigger: 'change' }
          ]
        }
      }
    },
    methods: {
      getInitFormData () {
        let output = {
          name: null,
          type: 'configmap',
          config_pars: []
        }
        this.type = 'create'
        if (!_.isEmpty(this.initData)) {
          this.type = 'modify'
          output = _.cloneDeep(this.initData)
        }
        return output
      },
      submit () {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.loading = true
            this.form.config_pars = this.trimLastEmpty(this.form.config_pars)
            this.$emit('submit', {formData: this.form, type: this.type})
          }
        })
      },
      trimLastEmpty (data) {
        let total = 0
        _.forOwn(data[data.length - 1], (value, key) => {
          if (value.val) {
            total++
          }
        })
        if (total === 0) {
          return data.slice(0, -1)
        }
        return data
      },
      clearForm () {
        this.form = this.getInitFormData()
        this.loading = false
        if (this.$refs.form) this.$refs.form.resetFields()
      },
      validateField (field) {
        this.$refs.form.validateField(field)
      }
    }
  }
</script>

<style lang="less" scoped>
</style>
 

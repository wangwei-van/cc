<template>
  <Form :label-width="labelWidth" :rules="rules" :model="form" ref="form">
    <BaseCollapse title="应用配置">
      <FormItem label="应用名称" prop="name">
        <i-input v-model="form.name" placeholder="请输入应用名称" class="form-input"></i-input>
      </FormItem>
      <FormItem label="应用类型">
        <Select v-model="form.type" class="form-input">
          <Option value="Deployment">无状态应用</Option>
        </Select>
      </FormItem>
      <FormItem label="应用描述" prop="desc">
        <i-input v-model="form.desc" placeholder="请输入描述信息" type="textarea" class="form-input"></i-input>
      </FormItem>
    </BaseCollapse>

    <BaseCollapse title="创建方式" class="border-bottom">
      <div style="text-align: center;">
        <CardRadioGroup :options="createOptions" :init="init" v-model="createType"></CardRadioGroup>
      </div>
    </BaseCollapse>

    <div style="text-align: center; padding: 15px;">
      <Button type="primary" @click="onClickNext">下一步</Button>
    </div>
  </Form>

</template>

<script>
  import CardRadioGroup from './CardRadioGroup'

  export default {
    name: 'deployment-form-step-one',
    components: {CardRadioGroup},
    props: {
      value: {
        type: Object,
        default: null
      }
    },
    data () {
      return {
        labelWidth: 100,
        init: true,
        form: this.getInitForm(),
        createOptions: [
          {
            title: '镜像',
            desc: '通过镜像创建',
            iconType: 'ios-home',
            value: 'image'
          },
          {
            title: '软件市场',
            desc: '通过软件市场创建',
            iconType: 'bag',
            value: 'market',
            disabled: true
          },
          {
            title: '复制已有应用',
            desc: '通过复制已有应用创建',
            iconType: 'ios-copy',
            value: 'copy',
            disabled: true
          },
        ],
        createType: 'image',
        rules: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'change' },
            { min: 3, max: 30, message: '长度在3～30之间', trigger: 'change' },
            { pattern: /^[\w.-]+$/, message: '只能为数字, 字母, 点, 中划线', trigger: 'change' },
          ],
          desc: [
            { max: 100, message: '不能超过100个字符', trigger: 'change' },
          ]
        }
      }
    },
    methods: {
      getInitForm () {
        if (!_.isEmpty(this.value)) {
          return _.cloneDeep(this.value)
        } else {
          return {
            name: '',
            desc: '',
            type: 'Deployment'
          }
        }
      },
      onClickNext () {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.init = false
            this.$emit('next-step', this.form)
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  @import '../../../style/variable';

  .border-bottom {
    border-bottom: 1px solid @border-color-split;
  }

  .form-input {
    width: 400px;
  }

</style>

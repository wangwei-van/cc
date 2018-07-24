<template>
  <div >
    <div style="margin-bottom: 5px; height: 32px;"
         v-if="!quotaEditing && infoData.status === 1 && infoData.action !== 'Submit'">
      <div style="display: inline-block; float: right;">
        <Button type="primary"
                icon="compose"
                style="margin-right: 5px;"
                @click="onClickModifyQuota">
          编辑Quota
        </Button>
      </div>
    </div>
    <div v-if="!isQuotaEmpty && !quotaEditing" style="padding: 15px;">
      <div v-for="item in infoItems" :key="item.label" class="info-item">
        <span class="item-label">{{item.label}}</span>
        <span class="item-value">{{infoData[item.prop]}}</span>
        <span class="form-unit" v-if="item.unit">{{item.unit}}</span>
      </div>
    </div>

    <Form :model="form" :rules="rules" :label-width="labelWidth" v-if="quotaEditing">
      <FormItem label="Pod：" prop="quotapod">
        <input-number v-model="form.quotapod" :min="0" :max="10000" class="form-input"></input-number>
        <span class="form-unit">个</span>
      </FormItem>
      <FormItem label="CPU：" prop="quotacpu">
        <input-number v-model="form.quotacpu" :min="0" :max="100" class="form-input"></input-number>
        <span class="form-unit">个</span>
      </FormItem>
      <FormItem label="内存：" prop="quotamem">
        <input-number v-model="form.quotamem" :min="0" class="form-input"></input-number>
        <span class="form-unit">GB</span>
      </FormItem>
      <FormItem label="存储卷：" prop="quotapvc">
        <input-number v-model="form.quotapvc" :min="0" class="form-input"></input-number>
        <span class="form-unit">个</span>
      </FormItem>
      <FormItem label="存储空间：" prop="quotastorage">
        <input-number v-model="form.quotastorage" :min="0" class="form-input"></input-number>
        <span class="form-unit">GB</span>
      </FormItem>
      <div class="form-footer">
        <Button type="primary" @click="onSubmit" :loading="createQuotaLoading">确定</Button>
        <Button type="text" @click="quotaEditing = false" style="margin-left: 10px;">取消</Button>
      </div>
    </Form>
    <Spin fix v-if="quotaLoading"></Spin>
  </div>

</template>

<script>
  import _ from 'lodash'

  export default {
    name: 'quota',
    props: {
      cluster: String,
      namespaceId: String,
      info: Object
    },
    computed: {
      isQuotaEmpty () {
        return _.isEmpty(this.info)
      },
      quotaName () {
        return `${this.namespace}-resource`
      }
    },
    data () {
      return {
        infoData: _.cloneDeep(this.info),
        quota: {},
        createQuotaLoading: false,
        form: {},
        labelWidth: 100,
        rules: {},
        quotaEditing: false,
        quotaLoading: false,
        infoItems: [
          {label: 'Pod：', prop: 'quotapod', unit: '个'},
          {label: 'Cpu：', prop: 'quotacpu', unit: '个'},
          {label: '内存：', prop: 'quotamem'},
          {label: '存储卷：', prop: 'quotapvc', unit: '个'},
          {label: '存储空间：', prop: 'quotastorage'}
        ]
      }
    },
    methods: {
      getInfoItemValue (prop) {
        return _.get(this.info, prop, '')
      },
      getQuotaFormData () {
        const output = {...this.form}
        output.quotamem += 'Gi'
        output.quotastorage += 'Gi'
        return output
      },
      
      onClickModifyQuota () {
        const items = ['quotapod', 'quotacpu', 'quotamem', 'quotapvc', 'quotastorage']
        this.form = {}
        items.map(item => {
          this.form[item] = this.toNumber(_.get(this.info, item))
        })
        this.quotaEditing = true
      },
      onSubmit () {
        this.createQuotaLoading = true
        this.$api.namespace.modifyNamespace(this.namespaceId, this.getQuotaFormData())
          .then(res => {
            this.$emit('quota-modify')
            this.$Message.success('修改成功')
            this.quotaEditing = false
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '修改失败')
          })
          .then(() => {
            this.createQuotaLoading = false
          })
      },
      toNumber (val, defaultVal) {
        if (val === undefined) {
          return defaultVal || 1
        }
        if (_.isString(val)) {
          return _.toNumber(val.replace(/[^\d.]/g, ''))
        }
        return val
      }
    },
    watch: {
      info (newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal)) {
          this.infoData = _.cloneDeep(newVal)
        }
      }
    }
  }
</script>

<style lang="less" scoped>
   @import '../../../style/variable';

  .form-unit {
    margin-left: 5px;
    color: @sub-text-color;
  }
  .form-input {
    width: 150px;
  }
  .form-footer {
    padding: 15px 25px;
    border-top: 1px solid @border-color-split;
  }
  .item-label, .item-value {
    line-height: 32px;
    display: inline-block;
  }
  .item-value {
    margin-left: 5px;
    color: @primary-color;
  }
  .item-label {
    width: 60px;
    /*text-align: right;*/
  }


</style>

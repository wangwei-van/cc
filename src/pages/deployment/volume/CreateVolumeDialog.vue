<template>
  <Modal :value="value" @input="val => $emit('input', val)" title="创建动态卷"
         :mask-closable="false"
         @on-ok="onSubmit"
         @on-visible-change="clear">
    <Form :model="form" :rules="rules" ref="form" :label-width="80" style="padding-right: 30px;">
      <FormItem prop="name" label="名称">
        <i-input v-model="form.name" placeholder="请输入名称"></i-input>
      </FormItem>
      <FormItem prop="storage" label="容量" required>
        <Slider v-model="form.storage" :min="minStorage" :max="maxStorage" show-input></Slider>
        <span style="position: absolute; right: -25px; top: -12px;">Gi</span>
      </FormItem>
      <FormItem prop="storageClass" label="存储池">
        <Select v-model="form.storageClass" placeholder="请选择存储池" @on-change="onStorageClassChange">
          <Option v-for="item in storageClasses" :key="item" :value="item">{{item}}</Option>
        </Select>
        <Alert style="margin: 5px 0 0;" v-if="storageClassAlert">{{storageClassAlert}}</Alert>
      </FormItem>
      <FormItem prop="accessMode" label="访问模式">
        <RadioGroup v-model="form.accessMode">
          <Radio v-for="item in showAccessModeList" :key="item" :label="item"></Radio>
        </RadioGroup>
      </FormItem>
      <FormItem prop="comment" label="备注">
        <i-input type="textarea" v-model="form.comment"></i-input>
      </FormItem>

    </Form>
  </Modal>

</template>

<script>
  export default {
    name: 'create-volume-dialog',
    props: {
      value: {
        type: Boolean,
        default: false
      },
      cluster: String
    },
    data () {
      return {
        rules: {
          name: [
            {required: true, message: '请输入名称'},
          ],
          storageClass: [],
          accessMode: [
            {required: true, message: '请选择访问模式'},
          ],
          comment: []
        },
        form: {
          accessMode: 'ReadWriteOnce'
        },
        storageClasses: [],
        accessModeList: ['ReadWriteOnce', 'ReadOnlyMany', 'ReadWriteMany'],
        minStorage: 1,
        maxStorage: 2048
      }
    },
    computed: {
      formData () {
        const data = {
          apiVersion: 'v1',
          kind: 'PersistentVolumeClaim',
          metadata: {
            name: this.form.name,
          },
          spec: {
            accessModes: [],
            storageClassName: this.form.storageClass,
            resources: {
              requests: {
                storage: (this.form.storage || this.minStorage) + 'Gi'
              }
            }
          }
        }
        if (this.form.storageClass) {
          data.spec.storageClassName = this.form.storageClass
        }
        if (this.form.accessMode) {
          data.spec.accessModes.push(this.form.accessMode)
        }
        if (this.form.comment) {
          _.set(data, ['metadata', 'annotations', 'comment.jd.com'], this.form.comment)
        }
        return data
      },
      showAccessModeList () {
        return this.form.storageClass === 'slow' ? ['ReadWriteOnce'] : this.accessModeList
      },
      storageClassAlert () {
        return {
          'slow': '非共享SATA，不支持多点挂载(multi-mount)，即不支持多个容器同时挂载',
          'shared-slow': '共享SATA盘，支持多点挂载（multi-mount），即支持多个容器同时挂载'
        }[this.form.storageClass]
      }
    },
    methods: {
      clear () {
        this.form = {
          accessMode: 'ReadWriteOnce'
        }
        this.$refs.form.resetFields()
      },
      onSubmit () {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.$emit('submit', this.formData)
          }
        })
      },
      loadStorageClassList () {
        this.$api.cluster(this.cluster).listStorageClasses()
          .then(res => {
            this.storageClasses = res.data.items.map(item => item.metadata.name)
          })
      },
      onStorageClassChange (className) {
        if (className === 'slow') {
          this.form.accessMode = 'ReadWriteOnce'
        }
      }
    },
    mounted () {
      this.loadStorageClassList()
    }
  }
</script>

<style lang="less" scoped>

</style>

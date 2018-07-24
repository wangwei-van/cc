<template>
  <Modal :value="value" @input="val => $emit('input', val)"
         :width="900"
         :closable="false"
         :styles="{marginRight: '0', top: '0'}"
         :transition-names="['move-right', 'fade']"
         @on-visible-change="onVisibleChange">
    <div slot="header">
      <div class="ivu-modal-header-inner">
        软件安装
        <a style="float: right;" @click="yaml = !yaml">{{yaml ? '编辑表单 ' : '编辑yaml'}}</a>
      </div>
    </div>
    <div style="height: calc(100vh - 139px);overflow: auto; padding-right: 10px; position: relative;" v-if="valueText">
      <Form :rules="rules" :model="form" ref="form">
        <Row :gutter="16">
          <i-col span="10">
            <FormItem label="名称：" prop="releaseName" :label-width="60">
              <i-input v-model="form.releaseName"></i-input>
            </FormItem>
          </i-col>
          <i-col span="7">
            <FormItem label="cluster: " prop="cluster" :label-width="70">
              <Select v-model="form.cluster">
                <Option v-for="item in clusterList" :key="item" :value="item">{{item}}</Option>
              </Select>
            </FormItem>
          </i-col>
          <i-col span="7">
            <FormItem label="namespace: " prop="namespace" :label-width="90">
              <Select v-model="form.namespace">
                <Option v-for="item in namespaceList" :key="item" :value="item">{{item}}</Option>
              </Select>
            </FormItem>
          </i-col>
        </Row>
      </Form>
      <YamlEditor v-model="text" v-if="yaml" height="calc(100% - 60px)"></YamlEditor>
      <div v-else>
        <ObjectEditor v-model="headerData"></ObjectEditor>
        <BaseCollapse v-for="(obj, key) in bodyData" :title="key" :key="key">
          <ObjectEditor v-if="isObject(obj)"
                        v-model="bodyData[key]"
                        :comment="comments"
                        :comment-prefix="key"
                        top-comment>
          </ObjectEditor>
          <ObjectEditor v-else :value="{key: obj}"
                        @input="val => {bodyData[key] = val[key]}"
                        :comment-prefix="key"
                        :comment="comments">
          </ObjectEditor>
        </BaseCollapse>
      </div>

    </div>

    <div slot="footer" style="text-align: center;">
      <Button type="primary" @click="submit" :loading="loading">安装</Button>
      <Button type="text" @click="$emit('input', false)">取 消</Button>
    </div>
  </Modal>

</template>

<script>
  const YAML2JSON = require("js-yaml");
  const JSON2YAML = require('json2yaml')
  import ObjectEditor from './object-editor/ObjectEditor'
  import {DNSNameRule} from '@/utils/validators'
  import {getCommentFromYaml} from './object-editor/comment-parser'
  import _ from 'lodash'

  export default {
    name: 'install-package-dialog',
    components: { ObjectEditor },
    props: {
      value: Boolean,
      valueText: {
        type: String,
        default: ''
      },
      loading: {
        type: Boolean,
        default: false
      }
    },
    data () {
      const namespace = localStorage.getItem('namespace')
      const cluster = localStorage.getItem('cluster')
      const [headerData, bodyData] = this.getData(this.valueText)
      return {
        text: '',
        form: {
          releaseName: '',
          cluster,
          namespace
        },
        clusterList: [],
        namespaceList: [],
        headerData,
        bodyData,
        yaml: false,
        rules: {
          releaseName: [{required: true, message: '名称不能为空'}, DNSNameRule],
          cluster: [{required: true, message: 'cluster不能为空'}],
          namespace: [{required: true, message: 'namespace不能为空'}]
        }
      }
    },
    computed: {
      comments () {
        return getCommentFromYaml(this.valueText)
      }
    },
    methods: {
      submit () {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.$emit('submit', {...this.form, yaml: this.getSubmitYaml()})
          }
        })
      },
      onVisibleChange (visible) {
        if (visible) {
          this.text = this.valueText
        }
      },
      loadData () {
        this.$api.listCluster()
          .then(res => {
            this.clusterList = res.data.items.map(item => item.metadata.name)
            if (!this.form.cluster && this.clusterList.length > 0) {
              this.form.cluster = this.clusterList[0]
            }
            this.loadNamespace()
          })
      },
      loadNamespace () {
        if (!this.form.cluster) return
        return this.$api.user.listNamespace(this.form.cluster)
          .then(res => {
            this.namespaceList = res.data.message.map(item => item.name)
          })
      },
      isObject (obj) {
        return _.isObject(obj) && !_.isArray(obj)
      },
      isArray (obj) {
        return _.isArray(obj)
      },
      getData (text) {
        const initData = YAML2JSON.safeLoad(text)
        const headerItems = _(initData).map((val, key) => key)
          .takeWhile(key => _.isArray(initData[key]) || !_.isObject(initData[key]))
          .value()
        const headerData = _.pick(initData, headerItems)
        const bodyData = _.pickBy(initData, (value, key) => !_.includes(headerItems, key))
        return [headerData, bodyData]
      },
      getYaml () {
        return JSON2YAML.stringify({...this.headerData, ...this.bodyData})
          .replace('---', '')
          .replace(/\n  /g, '\n')
      },
      getSubmitYaml () {
        return this.yaml ? this.text : this.getYaml()
      }
    },
    watch: {
      'form.cluster': function () {
        this.form.namespace = ''
        this.loadNamespace()
        console.log(this.comments)
      },
      valueText (newVal) {
        [this.headerData, this.bodyData] = this.getData(newVal)
      },
      yaml (visible) {
        if (visible) {
          this.text = this.getYaml()
        } else {
          [this.headerData, this.bodyData] = this.getData(this.text)
        }
      }
    },
    mounted () {
      this.loadData()
    }
  }
</script>

<style lang="less" scoped>

</style>

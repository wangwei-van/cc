<template>
  <div>
    <div style="margin-bottom: 10px;">
      <label for="">显示yaml</label>
      <i-switch v-model="showYaml" @on-change="toggleYaml"></i-switch>
    </div>
    <YamlEditor v-model="yamlFormData" :height="height" v-show="showYaml" @input="yamlChange"></YamlEditor>
    <Collapse v-show="!showYaml" :value="'12345678'.split('')">
      <Panel name="1">
        <span>应用配置</span>
        <div slot="content">
          <ItemValue :value="form.name" label="应用名称"></ItemValue>
          <ItemValue :value="form.type" label="应用类型"></ItemValue>
          <ItemValue :value="form.desc" label="应用描述"></ItemValue>
        </div>
      </Panel>
      <Panel name="2">
        <span>基础配置</span>
        <div slot="content">
          <ItemValue :value="form.image_name" label="镜像名称"></ItemValue>
          <ItemValue :value="form.image_tag" label="镜像版本"></ItemValue>
          <ItemValue :value="resourcesLabel" label="资源配置"></ItemValue>
          <ItemValue :value="form.replicas" label="实例数量"></ItemValue>
          <ItemValue :value="form.command" label="启动命令"></ItemValue>
          <ItemValue :value="form.mount_volumes" label="存储卷"
                     value-type="table"
                     :keys="[{key: 'volume', label: '动态卷'}, {key: 'path', label: '路径'}]">
          </ItemValue>
        </div>
      </Panel>
      <Panel name="8">
        <span>端口配置</span>
        <div slot="content">
          <ItemValue :value="form.port_pars"
                     :keys="[{key: 'containerPort', label: '容器端口'}, {key: 'protocol', label: '协议'}]"
                     value-type="table">
          </ItemValue>
        </div>
      </Panel>
      <Panel name="3">
        <span>环境变量</span>
        <div slot="content">
          <ItemValue :value="form.env_pars"
                     :keys="[{key: 'name', label: '键'}, {key: 'value', label: '值'}]"
                     value-type="table"
                     label="环境变量"></ItemValue>
        </div>
      </Panel>
      <Panel name="4">
        <span>配置文件</span>
        <div slot="content">
          <ItemValue :value="transferConfigs"
                     value-type="table"
                     label="配置文件挂载"
                     label-width="90px"
                     :keys="[{key: 'name', label: '配置文件'}, {key: 'path', label: '挂载目录'}]">
          </ItemValue>
        </div>
      </Panel>
      <Panel name="5">
        <span>调度管理</span>
        <div slot="content">
          <ItemValue :value="form.dispatch_pars"
                     :keys="[{key: 'name', label: '键'}, {key: 'value', label: '值'}]"
                     label="参数配置"
                     value-type="table">
          </ItemValue>
          <ItemValue :value="form.node_dispatch" label="节点调度"></ItemValue>
        </div>
      </Panel>
      <Panel name="6">
        <span>健康检查</span>
        <div slot="content">
          <ItemValue :value="form.hcType" label="健康检查类型" label-width="90px" v-if="hcKeys.length > 0"></ItemValue>
          <ItemValue :value="form.hc_http_headers" v-if="form.hcType === 'HTTP / HTTPS'"
                     :keys="[{key: 'name', label: '键'}, {key: 'value', label: '值'}]"
                     value-type="table"
                     label="主机头信息"
                     label-width="90px">
          </ItemValue>
          <ItemValue :value="hcValue"
                     :keys="hcKeys"
                     label="检查参数"
                     label-width="90px"
                     value-type="table">
          </ItemValue>
        </div>
      </Panel>
      <Panel name="7">
        <span>访问配置</span>
        <div slot="content">
          <ItemValue :value="form.port_pars && form.port_pars.length > 0 ? '是' : '否'" label="启用内部负载均衡" label-width="120px"></ItemValue>
          <ItemValue v-if="form.port_pars && form.port_pars.length > 0"
                     :value="servicePort"
                     value-type="table"
                     :keys="[
                       {key: 'port', label: '端口'},
                       {key: 'targetPort', label: '目标端口'},
                       {key: 'protocol', label: '协议'}
                     ]">
          </ItemValue>

          <ItemValue :value="enable_external" label="启用外部负载均衡" label-width="120px"></ItemValue>
          <ItemValue v-if="form.external_slb_rules.length > 0"
                     :value="form.external_slb_rules"
                     value-type="table"
                     :keys="[
                       {key: 'controller', label: '负载均衡器'},
                       {key: 'host', label: '域名'},
                       {key: 'port', label: '端口'},
                       {key: 'url', label: '访问路径'},
                       {key: 'rewrite', label: 'rewrite规则'}
                     ]">
          </ItemValue>
        </div>
      </Panel>

    </Collapse>
  </div>

</template>

<script>
import ItemValue from './ItemValue'
import {getFormDataFromJson, getAppJson} from './form-data'
import _ from 'lodash'

const YAML = require('json2yaml')
const YAML2JSON = require("js-yaml");

export default {
  name: 'deployment-config',
  components: { ItemValue },
  props: {
    configs: Array,
    formData: Object,
    deploymentInfo: Object
  },
  data () {
    return {
      form: _.cloneDeep(this.formData),
      enable_external: _.get(this.formData, 'external_slb_rules', []).length > 0,
      external_slb_rules: _.get(this.formData, 'external_slb_rules', []),
      showYaml: false,
      yamlFormData: '',
      height: '500px',
    }
  },
  methods: {
    yamlChange (data) {
      const jsonData = YAML2JSON.safeLoad(data)
      this.form = getFormDataFromJson(jsonData, this.configs)

      // 若更改port，则删除该port对应rule 
      const ports = _.map(this.form.port_pars, 'containerPort')
      this.external_slb_rules = _.head(_.partition(this.external_slb_rules, (rule) => {
        return ports.includes(rule.port)
      }))
      _.set(this.form, 'external_slb_rules', this.external_slb_rules)

      this.$emit('change-form', this.form)
    },
    toggleYaml (show) {
      if (show) {
        const jsonData = getAppJson(this.form);
        this.yamlFormData = YAML.stringify(jsonData, 4);
      } else {
        const jsonData = YAML2JSON.safeLoad(this.yamlFormData)
        this.form = getFormDataFromJson(jsonData, this.configs)
        _.set(this.form, 'external_slb_rules', this.external_slb_rules)
      }
    },
    getHcValue () {
      const hc = this.form.health_check
      return [{
        'initialDelaySeconds': hc.initialDelaySeconds,
        'timeoutSeconds': hc.timeoutSeconds,
        'periodSeconds': hc.periodSeconds,
        'successThreshold': hc.successThreshold,
        'failureThreshold': hc.failureThreshold,
        'httpGet.port': this.form.hc_http_port,
        'httpGet.path': this.form.hc_http_path,
        'httpGet.scheme': hc.httpGet.scheme,
        'httpGet.host': hc.httpGet.host,
        'tcpSocket.port': this.form.hc_tcp_port,
        'exec.command': this.form.hc_exec_command,
      }]
    },
    getHcKeys () {
      let arr = [
        {key: 'initialDelaySeconds', label: '启动后检测'},
        {key: 'timeoutSeconds', label: '检查超时'},
        {key: 'periodSeconds', label: '检查间隔'},
        {key: 'successThreshold', label: '健康阈值'},
        {key: 'failureThreshold', label: '不健康阈值'}
      ]
      if (this.form.hcType === 'HTTP / HTTPS') {
        return _.concat([
          {key: 'httpGet.scheme', label: '协议头'},
          {key: 'httpGet.host', label: '主机地址'},
          {key: 'httpGet.port', label: '端口'},
          {key: 'httpGet.path', label: '路径'}
        ], arr)
      } else if (this.form.hcType === 'TCP') {
        return _.concat([
          {key: 'tcpSocket.port', label: '端口'}
        ], arr)
      } else if (this.form.hcType === 'COMMAND') {
        return _.concat([
          {key: 'exec.command', label: '命令'}
        ], arr)
      }
      return []
    }
  },
  computed: {
    cluster () {
      return this.$route.params.cluster
    },
    namespace () {
      return this.$route.params.namespace
    },
    transferConfigs () {
      return _.map(this.form.config_files, config => {
        return _.merge({}, config, {name: config.name.substring(0, config.name.lastIndexOf('-'))})
      })
    },
    resourcesLabel () {
      const data = _.get(this.form, 'resources', {})
      return `${data[0]} / ${data[1]}`
    },
    hcValue () {
      return this.getHcValue()
    },
    hcKeys () {
      return this.getHcKeys()
    },
    servicePort () {
      let ports = _.cloneDeep(this.form.port_pars);
      _.forEach(ports, item => {
        item.port = item.containerPort
        item.targetPort = item.containerPort
        delete item.containerPort
      })
      return ports;
    }
  }
};
</script>

<style lang="less" scoped>
  @import '../../../style/variable';

  .padding-block {
    padding-left: 40px;
  }

  .item-switch {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    & > div {
      display: inline-block;
      text-align: center;
      padding-right: 10px;
      border-right: 1px solid @border-color-split;
      margin-right: 10px;
      font-weight: 700;
    }
  }

  .setting-block {
    border-bottom: 1px solid @border-color-split;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }

  .info-list {
    /*background: rgb(245, 242, 240);*/
    padding: 20px;
    border: 1px solid @border-color-split;
    /*margin-bottom: 6px;*/
  }

</style>

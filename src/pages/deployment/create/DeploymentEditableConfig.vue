<template>
  <div>
    <div style="margin-bottom: 10px;">
      <label for="">显示yaml</label>
      <i-switch v-model="showYaml" @on-change="toggleYaml"></i-switch>
    </div>
    <YamlEditor v-model="yamlFormData" :height="height" v-show="showYaml" @input="yamlChange"></YamlEditor>

    <Form :label-width="70" :rules="rules" :model="form" ref="form">
      <Collapse v-show="!showYaml" :value="'12345678'.split('')">
        <Panel name="1">
          <span>应用配置</span>
          <div slot="content">
            <FormItem label="应用名称">
              <Input v-model="form.name" class="form-input" disabled />
            </FormItem>
            <FormItem label="应用类型">
              <Input v-model="form.type" class="form-input" disabled />
            </FormItem>
            <FormItem label="应用描述">
              <Input v-model="form.desc" class="form-input" />
            </FormItem>
          </div>
        </Panel>
        <Panel name="2">
          <span>基础配置</span>
          <div slot="content">
            <FormItem label="镜像名称" prop="image_name">
              <InputButton :value="form.image_name"
                          icon="search"
                          @click="selectImageDialogVisible = true"
                          class="form-input">
              </InputButton>
            </FormItem>
            <FormItem label="镜像版本" prop="image_tag">
              <Select v-model="form.image_tag" class="form-input">
                <Option v-for="version in imageVersions" :key="version" :value="version">{{version}}</Option>
              </Select>
            </FormItem>
            <FormItem label="资源配置" prop="resources" required>
              <ResourceSelect v-model="form.resources"></ResourceSelect>
            </FormItem>
            <FormItem label="实例数量" prop="replicas" required>
              <Input v-model.number="form.replicas" class="form-input"></Input>
            </FormItem>
            <FormItem label="启动命令" prop="command">
              <Tooltip placement="right" content="多个命令以空格隔开">
                <Input v-model="form.command" class="form-input"></Input>
              </Tooltip>
            </FormItem>
            <div class="padding-block">
              <div style="margin-bottom: 5px;">
                <label for="" style="display: inline-block; width: 55px;">存储卷</label>
                <i-switch v-model="enableVolume"
                          @on-change="() => {form.mount_volumes = [], validateField('mount_volumes')}">
                </i-switch>
              </div>
              <VolumesSetting v-model="form.mount_volumes"
                              :volumes="volumes"
                              v-if="enableVolume"
                              @on-change="validateField('mount_volumes')"></VolumesSetting>
              <FormItem prop="mount_volumes" :label-width="1"></FormItem>
            </div>
          </div>
        </Panel>
        <Panel name="3">
          <span>环境变量</span>
          <div slot="content">
            <EnvSetting v-model="form.env_pars" :configs="configs" @on-change="validateField('env_pars')"></EnvSetting>
            <FormItem prop="env_pars" :label-width="1"></FormItem>
          </div>
        </Panel>
        <Panel name="4">
          <span>配置文件</span>
          <div slot="content">
            <MountConfigSetting v-model="form.config_files"
                    @on-change="validateField('config_files')"
                                :configs="configs">
            </MountConfigSetting>
            <FormItem prop="config_files" :label-width="1"></FormItem>
          </div>
        </Panel>
        <!-- <Panel name="5">
          <span>调度管理</span>
          <div slot="content">
            <div style="margin-bottom: 10px;">
              <ParsSetting v-model="form.dispatch_pars" @on-change="validateField('dispatch_pars')"></ParsSetting>
              <FormItem prop="dispatch_pars" :label-width="1"></FormItem>
            </div>
            <FormItem label="节点调度" :lable-width="70">
              <i-switch v-model="form.node_dispatch"></i-switch>
            </FormItem>
          </div>
        </Panel> -->
        <Panel name="6">
          <span>健康检查</span>
          <div slot="content">
            <RadioGroup v-model="form.hcType" style="margin-bottom: 10px;">
              <Radio v-for="item in healthCheckOptions"
                    :key="item"
                    :label="item"
                    style="margin-right: 30px;">
              </Radio>
            </RadioGroup>
            <div class="padding-block">
              <HealthCheck v-model="form" />
            </div>
          </div>
        </Panel>
        <Panel name="7">
          <span>端口配置</span>
          <div slot="content">
            <PortSetting v-model="form.port_pars" @on-change="validateField('port_pars')"></PortSetting>
            <FormItem prop="port_pars" :label-width="1"></FormItem>
          </div>
        </Panel>
        <Panel name="8">
          <span>访问配置</span>
          <div slot="content">
            <div class="item-switch">
              <div>
                <p>启用集群外部负载均衡</p>
                <p>负载均衡</p>
              </div>
              <i-switch v-model="enable_external"
                      :disabled="portList.length === 0"
                      @on-change="() => {form.external_slb_rules = [], validateField('external_slb_rules')}">
              </i-switch>
              <i style="margin-left: 5px" v-show="portList.length === 0">
                <Icon type="information-circled" />
                请先输入容器端口
              </i>
            </div>
            <ExternalSlbSetting v-model="form.external_slb_rules" v-if="enable_external"
                                @on-change="validateField('external_slb_rules')"
                                :app-name="form.name"
                                :port-list="portList">
            </ExternalSlbSetting>
            <FormItem prop="external_slb_rules" :label-width="1"></FormItem>
          </div>
        </Panel>

      </Collapse>
    </Form>
    <SelectImageDialog v-model="selectImageDialogVisible" @submit="onSelectImage"></SelectImageDialog>
    <div style="text-align: center; padding: 15px;">
      <Button type="ghost" style="margin-right: 20px;" @click="reset">重置</Button>
      <Button type="primary" @click="handleUpdate" :loading="updateLoading">确定</Button>
    </div>
  </div>

</template>

<script>
import { getFormDataFromJson, getAppJson, getServiceJson, getIngressJsonArr } from "./form-data";
import ResourceSelect from "./ResourceSelect";
import SelectImageDialog from "./SelectImageDialog";
import PortSetting from "./PortSetting";
import EnvSetting from "./EnvSetting";
import ParsSetting from "./ParsSetting";
import VolumesSetting from './VolumesSetting'
import MountConfigSetting from "./MountConfigSetting";
import HealthCheck from './HealthCheck'
import ExternalSlbSetting from "./ExternalSlbSetting";
import {parsValidator} from '@/utils/validators'
import _ from "lodash";

const YAML = require("json2yaml");
const YAML2JSON = require("js-yaml");

export default {
  name: "deployment-editable-config",
  components: {
    SelectImageDialog,
    ResourceSelect,
    PortSetting,
    EnvSetting,
    ParsSetting,
    VolumesSetting,
    MountConfigSetting,
    ExternalSlbSetting,
    HealthCheck
  },
  props: {
    cluster: String,
    namespace: String,
    deploymentInfo: Object,
    services: Array,
    ingressRules: Array,
    volumes: Array,
    configs: Array
  },
  data() {
    return {
      form: {},
      enable_external: this.ingressRules.length > 0 ? true : false,
      showYaml: false,
      yamlFormData: '',
      height: "500px",
      selectImageDialogVisible: false,
      imageVersions: [],
      enableVolume: false,
      healthCheckOptions: ["无", "HTTP / HTTPS", "TCP", "COMMAND"],
      updateLoading: false,
      rules: {
        desc: [{ max: 100, message: "不能超过100个字符", trigger: "change" }],
        image_name: [
          { required: true, message: '名称不能为空', trigger: 'change' },
        ],
        image_tag: [
          { required: true, message: '版本不能为空', trigger: 'change' },
        ],
        replicas: [
          {validator: (rule, value, cb) => {
            if (!value && value !== 0) {
              cb(new Error('实例数量不能为空'))
            }else if (value < 1 || value > 1024 || !/^\d+$/.test(value)) {
              cb(new Error('请输入1-1024之间的整数'))
            } else {
              cb()
            }
          }, trigger: 'change'},
        ],
        command: [
          {type: 'string', max: 120, message: '最长不超过120个字符', trigger: 'change'}
        ],
        dispatch_pars: [
          { validator: parsValidator, trigger: 'change' }
        ],
        env_pars: [
          { validator: parsValidator, trigger: 'change' }
        ],
        config_files: [
          { validator: parsValidator, trigger: 'change' }
        ],
        mount_volumes: [
          { validator: parsValidator, trigger: 'change' }
        ],
        hc_http_headers: { validator: parsValidator },
        hc_http_path: { type: 'string', required: true, message: '路径不能为空', trigger: 'change' },
        hc_http_port: { type: 'number', required: true, message: 'http端口不能为空', trigger: 'change' },
        hc_tcp_port: { type: 'number', required: true, message: 'tcp端口不能为空', trigger: 'change' },
        hc_exec_command: { type: 'string', required: true, message: '命令不能为空', trigger: 'change' },
        port_pars: [
          { validator: parsValidator, trigger: 'change' }
        ],
        external_slb_rules: [
          {validator: parsValidator, trigger: 'change', keyLabel: {
            'controller': '负载均衡器',
            'port': '端口',
            'url': '访问路径'
          }}
        ]
      }
    };
  },
  methods: {
    initData () {
      const form = getFormDataFromJson(this.deploymentInfo, this.configs)
      this.form = _.merge(form, {
        external_slb_rules: _.cloneDeep(this.ingressRules)
      })
      this.initImageVersions(_.get(form, 'image_name'))
      this.enableVolume = _.get(form, 'mount_volumes').length > 0
    },
    yamlChange (data) {
      const jsonData = YAML2JSON.safeLoad(data)
      const form = getFormDataFromJson(jsonData, this.configs)
      this.form = _.merge(form, {
        external_slb_rules: this.form.external_slb_rules
      })
    },
    toggleYaml (show) {
      if (show) {
        const jsonData = getAppJson(this.form);
        this.yamlFormData = YAML.stringify(jsonData, 4);
      } else {
        this.$refs.form.validate() // 清除之前残留的校验提示
        this.yamlChange(this.yamlFormData)
      }
    },
    initImageVersions (imageName, initTag) {
      const image_name = imageName.startsWith("gcr.io/") ? imageName.slice(7) : imageName;
      this.$api.image
        .listImageTag(image_name)
        .then(res => {
          this.imageVersions = res.data.tags;
          if (initTag) this.form.image_tag = this.imageVersions[0]
        })
        .catch(err => {
          this.imageVersions = _.concat([], getFormDataFromJson(this.deploymentInfo).image_tag)
          this.$NoticeAjaxError(err, "获取镜像版本信息失败");
        });
    },
    onSelectImage(name) {
      this.form.image_name = name;
      this.$refs.form.validateField("image_name");
      this.reloadImageTags(name)
    },
    reloadImageTags(imageName) {
      this.initImageVersions(imageName, true)
    },
    validateField(field) {
      this.$refs.form.validateField(field);
    },
    reset () {
      this.$refs.form.resetFields()
      this.initData()
      this.enable_external = this.ingressRules.length > 0 ? true : false
      if (this.showYaml) {
        const jsonData = getAppJson(this.form);
        this.yamlFormData = YAML.stringify(jsonData, 4);
      }
    },
    getCreateServicePort (ports) {
      return _.map(ports, item => ({
        name: item.name,
        port: item.port,
        targetPort: item.targetPort,
        protocol: item.protocol
      }))
    },
    updateService () {
      const createServiceData = getServiceJson(this.form)
      if (this.services.length > 0) {
        // 更新，现阶段app只对应一个service
        if (this.form.port_pars && this.form.port_pars.length > 0) {
          const initPorts = _.get(this.services, '0.spec.ports')
          if (!_.isEqual(createServiceData.spec.ports, this.getCreateServicePort(initPorts))) {
            const patchServiceData = {
              spec: {
                ports: _.map(createServiceData.spec.ports, (port, idx) => {
                  if (initPorts[idx]) {
                    return _.merge(initPorts[idx], port)
                  } else {
                    return port
                  }
                })
              }
            }
            this.$api.cluster(this.cluster).patchService(this.namespace, this.deploymentName, patchServiceData);
          }
        // 删除
        } else {
          this.$api.cluster(this.cluster).deleteService(this.namespace, this.deploymentName)
        }
      } else if (this.form.port_pars && this.form.port_pars.length > 0) {
        // 创建
        this.$api.cluster(this.cluster).createServices(this.namespace, createServiceData)
      }
    },
    updateIngress () {
      const ingressDataArr = getIngressJsonArr(this.form)
      if (this.ingressRules.length > 0) {
        const names = _.map(this.ingressRules, (item, idx) => {
          return `${this.form.name}-${idx}`
        })

        // 更新（先删除后重新创建）
        if (this.form.external_slb_rules && this.form.external_slb_rules.length > 0) {
          if (!_.isEqual(this.ingressRules, this.form.external_slb_rules)) {
            this.$api.cluster(this.cluster).deleteIngresses(this.namespace, names)
              .then(res => {
                if (ingressDataArr.length > 0) {
                  this.$api.cluster(this.cluster).createIngresses(this.namespace, ingressDataArr)
                }
              })
          }
        } else {
          this.$api.cluster(this.cluster).deleteIngresses(this.namespace, names)
        }
      // 创建
      } else if (ingressDataArr.length > 0) {
        this.$api.cluster(this.cluster).createIngresses(this.namespace, ingressDataArr)
      }
    },
    handleUpdate () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.updateLoading = true
          this.$Loading.start()
          this.$api.cluster(this.cluster).putDeployment(this.namespace, this.deploymentName, getAppJson(this.form))
            .then(res => {
              this.$Message.success('应用更新成功')
              this.updateService()
              this.updateIngress()
              this.$Loading.finish()
              this.updateLoading = false
            })
            .catch(err => {
              this.$NoticeAjaxError(err, '更新应用失败')
              this.$Loading.error()
              this.updateLoading = false
            })
        }
      })
    },
    validateField (field) {
      this.$refs.form.validateField(field)
    }
  },
  computed: {
    deploymentName () {
      return this.deploymentInfo.metadata.name
    },
    portList () {
      if (this.form.port_pars) {
        return _(this.form.port_pars).map('containerPort').filter(x => x).value()
      }
      return []
    }
  },
  watch: {
    portList (val) {
      if (val.length === 0) {
        this.enable_external = false
        this.form.external_slb_rules = []
      }
    }
  },
  created () {
    this.initData()
  }
};
</script>

<style lang="less" scoped>
@import '../../../style/variable';

.form-input {
  width: 400px;
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
.padding-block {
  padding-left: 10px;
}
</style>

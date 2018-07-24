<template>
  <div>
    <Form :label-width="labelWidth" :model="form" :rules="rules" ref="form">
      <BaseCollapse title="基础配置">
        <FormItem label="镜像名称" prop="image_name">
          <InputButton :value="form.image_name"
                       icon="search"
                       @click="selectImageDialogVisible = true"
                       placeholder="点击选择"
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
          <InputNumber v-model="form.replicas" :min="1" :max="1024" class="form-input"></InputNumber>
        </FormItem>
        <FormItem label="启动命令" prop="command">
          <Tooltip placement="right" content="多个命令以空格隔开">
            <i-input v-model="form.command" class="form-input"></i-input>
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

        <!--<FormItem label="IP池" prop="ippool">-->
          <!--<Select v-model="form.ippool" class="form-input" filterable>-->
            <!--<Option v-for="item in ipPools"-->
                    <!--:key="item.metadata.name"-->
                    <!--:value="item.metadata.name">-->
              <!--{{item.metadata.name}}-->
            <!--</Option>-->
          <!--</Select>-->
        <!--</FormItem>-->

      </BaseCollapse>

      <BaseCollapse title="环境变量" :value="true">
        <div class="padding-block">
          <EnvSetting v-model="form.env_pars" :configs="configs" @on-change="validateField('env_pars')"></EnvSetting>
          <FormItem prop="env_pars" :label-width="1"></FormItem>
        </div>
      </BaseCollapse>

      <BaseCollapse title="配置文件" :value="true">
        <div class="padding-block">
          <MountConfigSetting v-model="form.config_files"
                              @on-change="validateField('config_files')"
                              :configs="configs">
          </MountConfigSetting>
          <FormItem prop="config_files" :label-width="1"></FormItem>
        </div>
      </BaseCollapse>

      <!-- <BaseCollapse title="调度管理" :value="true">
        <div class="padding-block" style="margin-bottom: 10px;">
          <ParsSetting v-model="form.dispatch_pars" @on-change="validateField('dispatch_pars')"></ParsSetting>
          <FormItem prop="dispatch_pars" :label-width="1"></FormItem>
        </div>
        <FormItem label="节点调度" :lable-width="labelWidth">
          <i-switch v-model="form.node_dispatch"></i-switch>
        </FormItem>
      </BaseCollapse> -->

      <BaseCollapse title="健康检查" :value="true">
        <div style="padding: 0 40px;margin-bottom: 10px">
          <RadioGroup v-model="form.hcType">
            <Radio v-for="item in healthCheckOptions"
                   :key="item"
                   :label="item"
                   style="margin-right: 30px;">
            </Radio>
          </RadioGroup>
        </div>
        <div class="padding-block">
          <HealthCheck v-model="form" />
        </div>
      </BaseCollapse>

      <div style="text-align: center; padding: 15px;">
        <Button type="ghost" style="margin-right: 20px;" @click="onClickBackStep">上一步</Button>
        <Button type="primary" @click="onClickNextStep">下一步</Button>
      </div>
    </Form>
    <SelectImageDialog v-model="selectImageDialogVisible" @submit="onSelectImage"></SelectImageDialog>
  </div>

</template>

<script>
  import ResourceSelect from './ResourceSelect'
  import SelectImageDialog from './SelectImageDialog'
  import ParsSetting from './ParsSetting'
  import EnvSetting from './EnvSetting'
  import MountConfigSetting from './MountConfigSetting'
  import VolumesSetting from './VolumesSetting'
  import HealthCheck from './HealthCheck'
  import {parsValidator} from '@/utils/validators'
  import _ from 'lodash'

  export default {
    name: 'deployment-form-step-two',
    components: { ResourceSelect, SelectImageDialog, ParsSetting, EnvSetting, MountConfigSetting, HealthCheck, VolumesSetting },
    props: {
      value: {
        type: Object,
        default: null
      },
      configs: Array,
      volumes: Array
    },
    data () {
      return {
        labelWidth: 100,
        form: this.getInitForm(),
        imageVersions: [],
        selectImageDialogVisible: false,
        healthCheckOptions: ['无', 'HTTP / HTTPS', 'TCP', 'COMMAND'],
        // ipPools: [],
        enableVolume: !_.isEmpty(this.value.mount_volumes),
        rules: {
          image_name: [
            { required: true, message: '名称不能为空', trigger: 'change' },
          ],
          image_tag: [
            { required: true, message: '版本不能为空', trigger: 'change' },
          ],
          replicas: [
            {required: true, message: '实例数量不能为空', type: 'number', trigger: 'change', regexp: /^\d+$/g}
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
        }
      }
    },
    computed: {
      cluster () {
        return this.$route.params.cluster
      },
      namespace () {
        return this.$route.params.namespace
      }
    },
    methods: {
      getInitForm () {
        if (!_.isEmpty(this.value)) {
          this.form = _.cloneDeep(this.value)
          if (this.form.image_name) this.initImageVersions(this.form.image_name)
          return this.form
        } else {
          const image_name = this.$route.params.imageName || ''
          if (image_name) {
            setTimeout(function () {
              this.reloadImageTags(image_name)
            }.bind(this), 0)
          }
          return {
            image_name,
            image_tag: '',
            resources: ['0.5', '256Mi'],
            replicas: 1,
            env_pars: [],
            config_files: [],
            mount_volumes: [],
            // ippool: '',
            dispatch_pars: [],
            node_dispatch: false,
            hcType: '无',
            hc_http_headers: [],
            hc_http_port: null,
            hc_http_path: null,
            hc_tcp_port: null,
            hc_exec_command: null,
            health_check: {
              httpGet: {
                httpHeaders: [],
                scheme: 'HTTP',
                host: null,
                port: null,
                path: null
              },
              exec: {
                command: null
              },
              tcpSocket: {
                port: null
              },
              initialDelaySeconds: 15,
              timeoutSeconds: 1,
              periodSeconds: 10,
              successThreshold: 1,
              failureThreshold: 3
            },
          }
        }
      },
      onClickNextStep () {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.$emit('next-step', this.form)
          }
        })
      },
      onClickBackStep () {
        this.$emit('back-step', this.form)
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
      onSelectImage (name) {
        this.form.image_name = name
        this.$refs.form.validateField('image_name')
        this.reloadImageTags(name)
      },
      // load data
      reloadImageTags (imageName) {
        this.initImageVersions(imageName, true)
      },
      loadIpPools () {
        this.$api.cluster(this.cluster).listIpPools(this.namespace)
          .then(res => {
            this.ipPools = res.data.items
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取ippools列表失败')
          })
      },
      validateField (field) {
        this.$refs.form.validateField(field)
      }
    },
    mounted () {
      // this.loadIpPools()
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

  .padding-block {
    padding-left: 40px;
  }

</style>

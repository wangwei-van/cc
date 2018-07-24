<template>
  <div>
    <Form :model="form" :rules="rules" ref="form">
      <BaseCollapse title="端口配置">
        <div class="padding-block">
          <!-- <PortSetting v-model="form.port_pars"></PortSetting> -->
          <PortSetting v-model="form.port_pars" @on-change="validateField('port_pars')"></PortSetting>
          <FormItem prop="port_pars" :label-width="1"></FormItem>
        </div>
      </BaseCollapse>

      <BaseCollapse title="访问配置">
        <div class="padding-block">
          <!--<div class="item-switch">-->
            <!--<div>-->
              <!--<p>启用集群内部负载均衡</p>-->
              <!--<p>负载均衡</p>-->
            <!--</div>-->
            <!--<i-switch v-model="form.enable_internal" @on-change="onSwitchInternal"></i-switch>-->
          <!--</div>-->

          <!--<div v-show="form.enable_internal" class="setting-block">-->
            <!--<p style="margin-bottom: 5px;">映射端口</p>-->
            <!--<InternalSlbSetting v-model="form.internal_slb_port_map"-->
                                <!--@on-change="$refs.form.validateField('internal_slb_port_map')">-->
            <!--</InternalSlbSetting>-->
            <!--<FormItem prop="internal_slb_port_map" :label-width="1"></FormItem>-->
          <!--</div>-->

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
                              @on-change="$refs.form.validateField('external_slb_rules')"
                              :app-name="appName"
                              :port-list="portList">
          </ExternalSlbSetting>
          <FormItem prop="external_slb_rules" :label-width="1"></FormItem>


        </div>
      </BaseCollapse>

      <div style="text-align: center; padding: 15px;">
        <Button type="ghost" style="margin-right: 20px;" @click="onClickBackStep">上一步</Button>
        <Button type="primary" @click="onClickNextStep">下一步</Button>
      </div>
    </Form>
  </div>

</template>

<script>
  // import InternalSlbSetting from './InternalSlbSetting'
  import ExternalSlbSetting from './ExternalSlbSetting'
  import PortSetting from './PortSetting'
  import {parsValidator} from '@/utils/validators'
  import _ from 'lodash'

  export default {
    name: 'deployment-form-step-three',
    components: {
      PortSetting,
      ExternalSlbSetting
    },
    props: {
      value: {
        type: Object,
        default: null
      },
      appName: String
    },
    data () {
      return {
        form: this.getInitForm(),
        enable_external: (this.value && this.value.external_slb_rules) ? (this.value.external_slb_rules.length > 0) : false,
        rules: {
          external_slb_rules: [
            {validator: parsValidator, trigger: 'change', keyLabel: {
              'controller': '负载均衡器',
              'host': '域名',
              'port': '端口',
              'url': '访问路径'
            }}
          ],
          port_pars: [
            { validator: parsValidator, trigger: 'change' }
          ],
        }
      }
    },
    computed: {
      cluster () {
        return this.$route.params.cluster
      },
      namespace () {
        return this.$route.params.namespace
      },
      portList () {
        if (this.form.port_pars) {
          return _(this.form.port_pars).map('containerPort').filter(x => x).value()
        }
        return []
      }
    },
    methods: {
      getInitForm () {
        if (!_.isEmpty(this.value)) {
          return _.cloneDeep(this.value)
        } else {
          return {
            // enable_internal: false,
            // internal_slb_port_map: [],
            external_slb_rules: [],
            port_pars: [],
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
      validateField (field) {
        this.$refs.form.validateField(field)
      },
      onSwitchInternal (value) {
        if (!value) {
          this.form.internal_slb_port_map = []
        }
      }
    },
    watch: {
      portList (val) {
        if (val.length === 0) {
          this.enable_external = false
          this.form.external_slb_rules = []
        }
      }
    }
  }
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

</style>

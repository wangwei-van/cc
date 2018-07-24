<template>
  <div class="form-page">
    <Breadcrumb class="custom-breadcrumb">
        <BreadcrumbItem>应用</BreadcrumbItem>
        <BreadcrumbItem :to="listPath">应用管理</BreadcrumbItem>
        <BreadcrumbItem>创建应用</BreadcrumbItem>
    </Breadcrumb>

    <Steps :current="currentStep" class="custom-step">
      <Step title="应用配置"></Step>
      <Step title="容器编排"></Step>
      <Step title="网络配置"></Step>
      <Step title="完成"></Step>
    </Steps>

    <div class="page-content-box">
      <DeploymentFormStepOne v-show="currentStep === 0"
                             v-model="forms[0]"
                             @next-step="handleNextStep">
      </DeploymentFormStepOne>

      <DeploymentFormStepTwo v-show="currentStep === 1"
                             v-model="forms[1]"
                             :volumes="volumes"
                             :configs="configs"
                             @next-step="handleNextStep"
                             @back-step="handlePrevStep">
      </DeploymentFormStepTwo>

      <DeploymentFormStepThree v-show="currentStep === 2"
                               v-model="forms[2]"
                               :app-name="formData.name"
                               @next-step="handleNextStep"
                               @back-step="handlePrevStep">
      </DeploymentFormStepThree>

      <div v-if="currentStep === 3">
        <DeploymentConfig :form-data="formData" :configs="configs" @change-form="changeForm"></DeploymentConfig>

        <div style="text-align: center; padding: 15px;">
          <Button type="ghost" style="margin-right: 20px;" @click="backToForm">上一步</Button>
          <Button type="primary" @click="handleCreate" :loading="createLoading">创建</Button>
        </div>

      </div>

    </div>

  </div>

</template>

<script>
  import DeploymentFormStepOne from './DeploymentFormStepOne'
  import DeploymentFormStepTwo from './DeploymentFormStepTwo'
  import DeploymentFormStepThree from './DeploymentFormStepThree'
  import DeploymentConfig from './DeploymentConfig'
  import {getAppJson, getServiceJson, getIngressJsonArr} from './form-data'

  export default {
    name: 'DeploymentForm',
    components: { DeploymentFormStepOne, DeploymentFormStepTwo, DeploymentFormStepThree, DeploymentConfig },
    props: {
      cluster: String,
      namespace: String
    },
    data () {
      return {
        currentStep: 0,
        forms: [{}, {}, {}],
        labelWidths: [80],
        createLoading: false,
        formData: {},
        volumes: [],
        configs: []
      }
    },
    methods: {
      handlePrevStep (formData) {
        this.forms[this.currentStep] = formData
        this.currentStep --
      },
      backToForm () {
        this.currentStep --
        _.forEach(new Array(3), (val, idx) => {
          const srcObj = this.forms[idx]
          _.forEach(this.formData, (value, key) => {
            if (_.hasIn(srcObj, key)) {
              srcObj[key] = this.formData[key]
            }
          })
        })
      },
      handleNextStep (formData) {
        this.forms[this.currentStep] = formData
        this.currentStep ++
        this.setFormData()
      },
      setFormData () {
        this.formData = _.merge(
          {
            namespace: this.namespace
          },
          ...this.forms)
      },
      changeForm (data) {
        this.formData = data
      },
      handleCreate () {
        const appData = getAppJson(this.formData)
        const serviceData = getServiceJson(this.formData)
        const ingressDataArr = getIngressJsonArr(this.formData)
      
        this.createLoading = true
        this.$Loading.start()
        this.$api.cluster(this.cluster).createDeployment(this.namespace, appData)
          .then(res => {
            if (serviceData.spec.ports.length !== 0) {
              const uid = _.get(res.data, 'metadata.uid')
              _.set(serviceData, 'metadata.ownerReferences.0.uid', uid)
              this.$api.cluster(this.cluster).createServices(this.namespace, serviceData)
              if (ingressDataArr.length > 0) {
                this.$api.cluster(this.cluster).createIngresses(this.namespace, ingressDataArr)
              }
            }
            this.$Message.success('应用创建成功')
            this.$Loading.finish()
            setTimeout(() => {
              this.$router.push({name: 'deploy-deployment-list', params: this.$route.params})
            }, 500)
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '创建应用失败')
            this.$Loading.error()
            this.createLoading = false
          })
      },
      loadVolumes () {
        this.$api.cluster(this.cluster).listVolumes(this.namespace)
          .then(res => {
            this.volumes = res.data.items
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取存储卷列表失败')
          })
      },
      loadConfigs () {
        Promise.all([
          this.$api.cluster(this.cluster).listConfigs('configmap', this.namespace),
          this.$api.cluster(this.cluster).listConfigs('secret', this.namespace)
        ])
          .then(res => {
            const configmaps = res[0].data.items.map(item => _.merge(item, {id: `${item.metadata.name}-configmap`}))
            const secrets = res[1].data.items.map(item => _.merge(item, {id: `${item.metadata.name}-secret`}))
            this.configs = _.concat([], configmaps, secrets)
          })
          .catch(err => {
            this.$NoticeAjaxError(err, "获取config文件列表失败");
          });
      }
    },
    computed: {
      listPath () {
        return {
          name: 'deploy-deployment-list',
          params: this.$route.params
        }
      }
    },
    created () {
      this.loadVolumes()
      this.loadConfigs()
    }
  }
</script>

<style lang="less" scoped>
  @import '../../../style/variable';

  .form-page {
    background: @background-color-base;
    position: absolute;
    top: 20px;
    width: 100%;
    padding-right: 40px;
    min-height: 100%;
    z-index: 10;
  }

</style>

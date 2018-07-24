<template>
  <div class="form-page">
    <Breadcrumb class="custom-breadcrumb">
        <BreadcrumbItem>应用</BreadcrumbItem>
        <BreadcrumbItem :to="listPath">路由管理</BreadcrumbItem>
        <BreadcrumbItem>创建路由</BreadcrumbItem>
    </Breadcrumb>

    <div class="page-content-box">
      <Form :model="form" :label-width="100" :rules="rules" ref="form" width="">
        <FormItem label="路由名称" prop="name" required>
          <Input v-model="form.name" class="form-input" />
        </FormItem>
        <FormItem label="访问路径" prop="path" required>
          <Input v-model="form.path" class="form-input" />
        </FormItem>
        <FormItem label="所属应用" prop="path" required>
          <Select v-model="form.serviceName" class="form-input">
            <option v-for="name in serviceNameList" :key="name">
              {{name}}
            </option>
          </Select>
        </FormItem>
        <FormItem label="所属端口" prop="port" required>
          <Select v-model="form.servicePort" class="form-input">
            <option v-for="port in servicePortList" :key="port">
              {{port}}
            </option>
          </Select>
        </FormItem>
      </Form>
    </div>
  </div>
</template>

<script>
  import {DNSNameRule} from '@/utils/validators'

  export default {
    name: 'create-ingress',
    props: {
      cluster: String,
      namespace: String
    },
    data () {
      return {
        services: {
          type: Object,
          default: () => {
            return {}
          }
        },
        form: this.getInitForm(),
        rules: {
          name: [
            {type: 'string', required: true, message: '名称不能为空'},
            DNSNameRule
          ]
        }
      }
    },
    computed: {
      serviceNameList () {

      },
      servicePortList () {

      },
      listPath () {
        return {
          name: 'ingress-list',
          params: this.$route.params
        }
      }
    },
    methods: {
      getInitForm () {
        return {
          name: null,
          path: null,
          serviceName: null,
          servicePort: null
        }
      },
      changeServiceName () {

      },
    }
  }
</script>

<style lang="less" scoped>
  .form-input {
    width: 400px;
  }
</style>

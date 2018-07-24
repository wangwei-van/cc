<template>
  <div>
    <div class="custom" v-if="value.hcType === 'HTTP / HTTPS'">
      <label>主机头信息</label>
      <FormItem prop="hc_http_headers">
        <ParsSetting v-model="value.hc_http_headers" @on-change="handleChange()"></ParsSetting>
      </FormItem>
    </div>

    <table class="settings-table" style="margin-bottom: 20px" v-if="value.hcType === 'HTTP / HTTPS'">
      <thead>
        <tr class="col-3">
          <th>协议</th>
          <th>主机地址</th>
          <th class="ivu-form-item-required"><label class="ivu-form-item-label">请求路径</label></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <Select v-model="value.health_check.httpGet.scheme" transfer>
              <Option value="HTTP">HTTP</Option>
              <Option value="HTTPS">HTTPS</Option>
            </Select>
          </td>
          <td>
            <Input v-model="value.health_check.httpGet.host" @on-change="handleChange()" style="width: 100%" />
          </td>
          <td>
            <FormItem prop="hc_http_path">
              <Input v-model="value.hc_http_path" @on-change="handleChange()" style="width: 100%" />
            </FormItem>
          </td>
        </tr>
      </tbody>
    </table>

    <table class="settings-table" style="margin-bottom: 20px" v-if="value.hcType !== '无'">
      <thead>
        <tr class="col-3">
          <th v-if="value.hcType === 'COMMAND'" class="ivu-form-item-required"><label class="ivu-form-item-label">命令（多个命令以空格隔开）</label></th>
          <th v-else class="ivu-form-item-required"><label class="ivu-form-item-label">目标容器端口</label></th>
          <th>启动后检测</th>
          <th>检查超时</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td v-if="value.hcType === 'HTTP / HTTPS'" key="http">
            <FormItem prop="hc_http_port">
              <InputNumber v-model="value.hc_http_port" @on-change="handleChange()" style="width: 100%" required />
            </FormItem>
          </td>
          <td v-else-if="value.hcType === 'TCP'" key="tcp">
            <FormItem prop="hc_tcp_port">
              <InputNumber v-model="value.hc_tcp_port" @on-change="handleChange()" style="width: 100%" required />
            </FormItem>
          </td>
          <td v-else>
            <FormItem prop="hc_exec_command" key="exec">
              <Input v-model="value.hc_exec_command" @on-change="handleChange()" style="width: 100%" required />
            </FormItem>
          </td>
          <td>
            <InputNumber v-model="value.health_check.initialDelaySeconds" :min="1" @on-change="handleChange()" />
            <Button disabled>秒</Button>
          </td>
          <td>
            <InputNumber v-model="value.health_check.timeoutSeconds" :min="1" @on-change="handleChange()" />
            <Button disabled>秒</Button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <table class="settings-table" v-if="value.hcType !== '无'">
      <thead class="col-3">
        <tr>
          <th>检查间隔</th>
          <th>健康阈值</th>
          <th>不健康阈值</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <InputNumber v-model="value.health_check.periodSeconds" :min="1" @on-change="handleChange()" />
            <Button disabled>秒</Button>
          </td>
          <td>
            <InputNumber v-model="value.health_check.successThreshold" :min="1" @on-change="handleChange()" />
            <Button disabled>成功</Button>
          </td>
          <td>
            <InputNumber v-model="value.health_check.failureThreshold" :min="1" @on-change="handleChange()" />
            <Button disabled>失败</Button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  import ParsSetting from './ParsSetting'

  export default {
    name: 'health-check',
    components: {ParsSetting},
    props: {
      value: Object
    },
    methods: {
      handleChange () {
        this.$emit('input', this.value)
        this.$emit('on-change', this.value)
      }
    }
  }
</script>

<style lang="less" scoped>
  :disabled {
    cursor: initial;
    color: inherit;
    &:hover {
      color: inherit;
      background-color: #f6f8fc;
    }
  }
  .custom { 
    margin-bottom: 20px;
    >label {
      display: inline-block;
      margin: 10px 0;
    }
  }
  .custom /deep/ .ivu-input-wrapper {
    width: 100%!important;
  }
  .settings-table {
    width: 780px;
    tr.col-3 th {
      width: 33.33%;
    }
  }
  /deep/ .ivu-form-item {
    margin-bottom: 0;
    .ivu-form-item-content {
      margin-left: 0!important;
    }
  }
  /deep/ .ivu-input-wrapper {
    width: initial
  }
  /deep/ .ivu-input-number {
    width: initial
  }
</style>

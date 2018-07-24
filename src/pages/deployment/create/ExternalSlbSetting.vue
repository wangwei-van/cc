<template>
  <table class="settings-table">
    <thead>
      <tr>
        <th>负载均衡器(SLB)</th>
        <th>
          <span>域名</span>
          <Tooltip placement="top" transfer>
            <Icon type="information-circled"></Icon>
            <div slot="content" class="tooltip-content">
              <span>如果您未在 online 申请对应的DNS域名，请在本机的 /etc/hosts 文件中增加：</span><br>
              <span>172.25.65.198</span>&nbsp;
              <span>{{appName}}.[port].example.com</span>
            </div>
          </Tooltip>
        </th>
        <th>端口</th>
        <th>访问路径</th>
        <th>rewrite规则</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(rowData, index) in data" :key="index">
        <td>
          <Select v-model="rowData.controller" @on-change="handleChange">
            <Option value="nginx">nginx</Option>
          </Select>
        </td>
        <td>
          <i-input v-model="rowData.host" @on-change="handleChange"></i-input>
        </td>
        <td>
          <Select v-model="rowData.port" @on-change="changePort(index)" style="width: 100px;">
            <!-- <Option v-for="item in availablePortList" :key="item.name" :value="item.port" :disabled="item.disabled"> -->
            <Option v-for="port in portList" :key="port" :value="port">
              {{port}}
            </Option>
          </Select>
        </td>
        <td>
          <i-input v-model="rowData.url" @on-change="handleChange"></i-input>
        </td>
        <td>
          <i-input v-model="rowData.rewrite" @on-change="handleChange"></i-input>
        </td>
        <td>
          <Icon type="minus-circled" class="table-tool-icon" @click.native="handleRemove(index)"></Icon>
          <Icon type="plus-circled" class="table-tool-icon add-icon" @click.native="handleAdd"></Icon>
        </td>
      </tr>
    </tbody>

  </table>

</template>

<script>
  import _ from 'lodash'
  import {parSettingMixin} from '@/mixins'

  const keys = ['controller', 'host', 'port', 'url', 'rewrite']

  export default {
    name: 'external-slb-setting',
    mixins: [parSettingMixin],
    props: {
      value: Array,
      appName: String,
      portList: {
        type: Array,
        default: () => []
      }
    },
    data () {
      return {
        data: this.value && this.value.length > 0 ?
                this.value : (this.portList.length > 0 ?
                  [{controller: 'nginx', host: `${this.appName}.${this.portList[0]}.example.com`, port: this.portList[0], url: '', rewrite: ''}] :
                  [{controller: 'nginx', host: '', port: '', url: '', rewrite: ''}]),
        keys
      }
    },
    computed: {
      availablePortList () {
        const selectedPort = _.map(this.data, 'port')
        return _.map(this.portList, port => ({
          port: port,
          disabled: selectedPort.indexOf(port) > -1
        }))
      }
    },
    methods: {
      getEmptyRow () {
        if (this.portList.length > 0) {
          return { controller: 'nginx', host: `${this.appName}.${this.portList[0]}.example.com`, port: this.portList[0], url: '', rewrite: '' }
        } else {
          return { controller: 'nginx', host: '', port: '', url: '', rewrite: '' }
        }
      },
      changePort (idx) {
        const port = this.data[idx].port
        const host = this.data[idx].host
        if (!port) {
          this.data[idx].host = ''
        } else if (!host) {
          this.data[idx].host = `${this.appName}.${port}.example.com`
        } else {
          var reg = new RegExp(`\^${this.appName}\\.\\d+\\.example\\.com$`)
          if (reg.test(host)) {
            this.data[idx].host = host.replace(/\d+/, port)
          }
        }
        this.handleChange()
      }
    },
    watch: {
      value (newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal)) {
          this.data = this.value && this.value.length > 0 ? this.value : [this.getEmptyRow()]
        }
      },
      portList (newVal, oldVal) {
        // 删除服务port时同时删除对应外部访问数据
        if (!_.isEqual(newVal, oldVal) && newVal.length < oldVal.length) {
          const deletePort = _.difference(oldVal, newVal)[0]
          this.data = _.filter(this.data, item => item.port !== deletePort)
          this.handleChange()
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .tooltip-content {
    white-space: normal;
    word-break: break-all;
    word-wrap: break-word;
  }
</style>

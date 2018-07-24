<template>
  <table class="settings-table">
    <thead>
      <tr>
        <th>容器端口</th>
        <th>负载均衡端口</th>
        <th>协议</th>
        <!--<th>负载均衡地址</th>-->
        <!--<th>端口名称</th>-->
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(rowData, index) in data" :key="index">
        <td>
          <i-input v-model.number="rowData.docker_port" @on-change="handleChange" class="form-input"></i-input>
        </td>
        <td>
          <i-input v-model.number="rowData.slb_port" @on-change="handleChange" class="form-input"></i-input>
        </td>
        <td>
          <Select v-model="rowData.protocol" @on-change="handleChange" class="form-input">
            <Option value="TCP">TCP</Option>
            <Option value="UDP">UDP</Option>
          </Select>
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
  import {parSettingMixin} from '@/mixins'

  export default {
    name: 'pars-setting',
    mixins: [parSettingMixin],
    props: {
      initData: Array
    },
    data () {
      return {
        data: [
          {docker_port: '', slb_port: '', protocol: ''}
        ],
        keys: ['docker_port', 'slb_port', 'protocol']
      }
    },
    watch: {
      value (newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal)) {
          this.data = this.value && this.value.length > 0 ? this.value : [this.getEmptyRow()]
        }
      }
    }
  }
</script>

<style lang="less" scoped>

  .form-input {
    width: 100px;
  }

</style>

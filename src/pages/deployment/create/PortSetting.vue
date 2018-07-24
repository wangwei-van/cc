<template>
  <table class="settings-table">
    <thead>
      <tr>
        <th>容器端口</th>
        <th>协议</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(rowData, index) in data" :key="index">
        <td>
          <InputNumber v-model="rowData.containerPort" @on-change="handleChange" style="width: 150px"></InputNumber>
        </td>
        <td>
          <Select v-model="rowData.protocol" @on-change="handleChange" style="width: 300px;">
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
    name: 'port-setting',
    mixins: [parSettingMixin],
    props: {
      value: Array
    },
    data () {
      return {
        data: this.value && this.value.length > 0 ? this.value : [{containerPort: null, protocol: 'TCP'}],
        keys: ['containerPort', 'protocol'],
      }
    },
    methods: {
      getEmptyRow () {
        return { containerPort: null, protocol: 'TCP' }
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

</style>

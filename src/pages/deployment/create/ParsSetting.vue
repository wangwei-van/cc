<template>
  <table class="settings-table">
    <thead>
      <tr>
        <th>键</th>
        <th>值</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(rowData, index) in data" :key="index">
        <td>
          <i-input v-model.trim="rowData.name" @on-change="handleChange"></i-input>
        </td>
        <td>
          <i-input v-model.trim="rowData.value" @on-change="handleChange" style="width: 300px;"></i-input>
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
  import _ from 'lodash'

  export default {
    name: 'pars-setting',
    mixins: [parSettingMixin],
    props: {
      value: Array
    },
    data () {
      return {
        data: this.value && this.value.length > 0 ? this.value : [{name: '', value: ''}],
        keys: ['name', 'value']
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

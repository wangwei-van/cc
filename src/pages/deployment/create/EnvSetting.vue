<template>
  <div>
    <div style="height:32px;line-height:32px;margin-bottom: 5px;">
      <span>从配置文件导入</span>
      <i-switch v-model="enableEnvConfig" @on-change="env_config = null">
      </i-switch>
      <Select v-model="env_config" style="width: 300px" filterable @on-change="changeEnvConfig" v-if="enableEnvConfig">
        <Option v-for="item in configs" :key="item.id" :value="item.id">
          {{item.metadata.name}}
        </Option>
      </Select>
    </div>
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
  </div>

</template>

<script>
  import {parSettingMixin} from '@/mixins'
  import _ from 'lodash'

  export default {
    name: 'env-setting',
    mixins: [parSettingMixin],
    props: {
      value: Array,
      configs: Array
    },
    data () {
      return {
        enableEnvConfig: false,
        env_config: '',
        data: this.value && this.value.length > 0 ? this.value : [{name: '', value: '', config: 'null'}],
        keys: ['name', 'value', 'config']
      }
    },
    methods: {
      getEmptyRow () {
        return {name: '', value: '', config: 'null'}
      },
      changeEnvConfig () {
        const config = _.head(_.filter(this.configs, item => item.id === this.env_config))
        this.data = _.map(config.data, (val, key) => {
          return {name: key, value: val, config: _.merge(_.cloneDeep(config), {key})}
        })
        this.handleChange()
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

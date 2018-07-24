<template>
  <table class="settings-table">
    <thead>
      <tr>
        <th>配置文件</th>
        <th>挂载目录</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(rowData, index) in data" :key="index">
        <td>
          <Select v-model="rowData.name" style="width: 180px;" @on-change="handleChange">
            <Option v-for="item in configs"
                    :key="item.id"
                    :value="item.id"
                    :disabled="selectedIds.includes(item.id)">
              {{item.metadata.name}}
            </Option>
          </Select>
          <Button type="text" icon="document-text" :disabled="!rowData.name" @click="onClickShowConfig(rowData.name)">
          </Button>
        </td>
        <td>
          <i-input v-model="rowData.path" @on-change="handleChange" style="width: 300px;"></i-input>
        </td>
        <td>
          <Icon type="minus-circled" class="table-tool-icon" @click.native="handleRemove(index)"></Icon>
          <Icon type="plus-circled"
                class="table-tool-icon add-icon"
                v-show="data.length < configs.length"
                @click.native="handleAdd"></Icon>
        </td>
      </tr>
    </tbody>
     <Modal v-model="configDialogVisible" :title="showConfig.metadata.name" :width="700">
       <Tabs type="card" v-if="configDialogVisible">
         <TabPane v-for="(val, key) in showConfig.data" :key="key" :label="key" :name="key">
           <i-input type="textarea" :value="val" :rows="20" readonly></i-input>
         </TabPane>
       </Tabs>

    </Modal>

  </table>

</template>

<script>
  import {parSettingMixin} from '@/mixins'
  import _ from 'lodash'

  export default {
    name: 'pars-setting',
    mixins: [parSettingMixin],
    props: {
      value: Array,
      configs: {
        type: Array,
        default: () => []
      },
    },
    data () {
      return {
        data: this.value && this.value.length > 0 ? this.value : [{name: '', path: ''}],
        keys: ['name', 'path'],
        configDialogVisible: false,
        showConfig: {metadata: {}}
      }
    },
    methods: {
      onClickShowConfig (id) {
        this.showConfig = _(this.configs).filter(item => item.id === id).first()
        this.configDialogVisible = true
      }
    },
    computed: {
      selectedIds () {
        return this.data.map(row => row.name)
      },
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
  @import '../../../style/variable';

  /deep/ textarea.ivu-input {
    box-shadow: none;
    &:hover, &:focus {
      border-color: @border-color-base;
      box-shadow: none;
    }
  }
</style>

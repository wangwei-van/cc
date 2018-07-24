<template>
  <table class="settings-table">
    <thead>
      <tr>
        <th>键</th>
        <th style="width: 60%">值</th>
        <th style="width: 80px">操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(rowData, index) in data" :key="index">
        <td>
          <i-input v-model.trim="rowData.name" @on-change="handleChange"></i-input>
        </td>
        <td>
          <i-input v-model.trim="rowData.value.val" @on-change="handleChange" :disabled="rowData.value.type === 'file'">
            <span slot="append" class="upload-btn" @click="selectFile(index)">
              <Icon type="upload" style="margin-right: 3px" />上传
            </span>
          </i-input>
          <input type="file" style="display:none" :ref="`file${index}`" @change="getContent($event, index)" />
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
  /**
   * @说明: 为区分是否为上传的文件，将数据组中value定义为{val: '', type: 'file}（非文件type可为空）
   *        文件对应的data数据组中val为文件名称，v-model对应的子组件value的数据组中val为文件内容
   * @说明人: jrwangwei3
   * @timestamp: 2018/07/02
   */

  import {parSettingMixin} from '@/mixins'
  import _ from 'lodash'

  export default {
    name: 'config-pars',
    mixins: [parSettingMixin],
    props: {
      value: Array
    },
    data () {
      return {
        data: this.value && this.value.length > 0 ? this.value : [{name: '', value: {val: ''}}],
        fileMap: {}
      }
    },
    methods: {
      handleChange () {
        let data = _.cloneDeep(this.data)
        _.forEach(data, item => {
          if (item.value && item.value.type === 'file') {
            item.value.val = this.fileMap[item.value.val]
          }
        })
        this.$emit('input', data)
        this.$emit('on-change', data)
      },
      
      getEmptyRow () {
        return {name: '', value: {val: ''}}
      },

      selectFile (idx) {
        this.$refs[`file${idx}`][0].click()
      },
      getContent (evt, idx) {
        const _self = this
        const file = evt.target.files[0]
        if (file.size/1024/1024 > 1) {
          this.$Message.warning('文件大小限制在1M之内')
          this.$refs[`file${idx}`][0].value = null
          return;
        }

        const reader = new FileReader();
        reader.onload = function () {
          _self.fileMap[file.name] = this.result
          _self.data[idx].value.val = file.name
          _self.data[idx].value.type = 'file'
          _self.handleChange()
        }
        reader.readAsText(file);
      }
    }
  }
</script>

<style lang="less" scoped>
  @import '../../style/variable';

  .settings-table {
    width: 100%;
    .ivu-input-group {
      border-collapse: collapse;
      top: 0;
      /deep/ .ivu-input-group-append {
        border: none;
      }
    }
  }
  .upload-btn {
    cursor: pointer;
    &:hover {
      color: @primary-color;
    }
  }
</style>

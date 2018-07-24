<template>
  <table class="settings-table">
    <thead>
      <tr>
        <th>存储卷</th>
        <th>挂载目录</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(rowData, index) in data" :key="index">
        <td>
          <Select v-model="rowData.volume" style="width: 180px;" @on-change="handleChange">
            <Option v-for="item in volumes"
                    :key="item.metadata.name"
                    :value="item.metadata.name"
                    :disabled="selectedNames.has(item.metadata.name)">
              {{item.metadata.name}}
            </Option>
          </Select>
          <Button type="text" icon="document-text" :disabled="!rowData.volume" @click="onClickShowVolume(rowData.volume)">
          </Button>
        </td>
        <td>
          <i-input v-model="rowData.path" @on-change="handleChange" style="width: 300px;"></i-input>
        </td>
        <td>
          <Icon type="minus-circled" class="table-tool-icon" @click.native="handleRemove(index)"></Icon>
          <Icon type="plus-circled"
                class="table-tool-icon add-icon"
                v-show="data.length < volumes.length"
                @click.native="handleAdd"></Icon>
        </td>
      </tr>
    </tbody>
     <Modal v-model="volumeDialogVisible" :title="showVolume.metadata.name" :width="400">
       <div v-if="volumeDialogVisible">
         <div v-for="item in showVolumeItems" :key="item.label" style="margin: 10px;">
           <label style="width: 60px; display: inline-block;">{{item.label}}：</label>
           <span>{{getVolumeItem(item.key)}}</span>
         </div>
       </div>
    </Modal>

  </table>

</template>

<script>
  import {parSettingMixin} from '@/mixins'
  import _ from 'lodash'

  export default {
    name: 'volumes-setting',
    mixins: [parSettingMixin],
    props: {
      value: Array,
      volumes: {
        type: Array,
        default: [],
      },
    },
    data () {
      return {
        data: this.value && this.value.length > 0 ? this.value : [{volume: '', path: ''}],
        keys: ['volume', 'path'],
        volumeDialogVisible: false,
        showVolume: {metadata: {}},
        showVolumeItems: [
          {label: '名称', key: 'metadata.name'},
          {label: '状态', key: 'status.phase'},
          {label: '容量', key: 'spec.resources.requests.storage'},
          {label: '访问模式', key: 'spec.accessModes'},
          {label: '存储池', key: 'spec.storageClassName'},
          {label: '备注', key: ['metadata', 'annotations', 'comment.jd.com']},
          {label: '创建时间', key: 'metadata.creationTimestamp'}
        ]
      }
    },
    methods: {
      onClickShowVolume(volume) {
        this.showVolume = _(this.volumes).filter(item => item.metadata.name === volume).first()
        this.volumeDialogVisible = true
      },
      getVolumeItem (key) {
        return _.get(this.showVolume, key)
      }
    },
    computed: {
      selectedNames () {
        return new Set(this.data.map(row => row.volume))
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

</style>

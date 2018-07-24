<template>
  <div class="config-item-value" :style="{padding}">
    <span class="item-label" :style="{width: labelWidth}" v-if="label">{{label}}：</span>
    <div class="item-value">
      <span v-if="valueType === 'string'">
        {{stringValue || '无'}}
      </span>
      <div v-else-if="valueType === 'table'">
        <span v-if="value === undefined || value.length === 0 || keys.length === 0">无</span>
        <table v-else class="settings-table">
          <thead>
            <tr>
              <th v-for="key in keys" :key="key.key">{{key.label}}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in value" :key="idx">
              <td v-for="key in keys" :key="key.key">{{truncate(row[key.key])}}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="valueType === 'items'">
        <span v-if="value === undefined || value.length === 0">无</span>
        <div v-else>
          <Tag v-for="item in value" :key="item" style="margin-right: 5px;">{{item}}</Tag>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
  import _ from 'lodash'

  export default {
    name: 'item-value',
    props: {
      value: [String, Number, Boolean, Array, Object],
      label: String,
      labelWidth: {
        type: String,
        default: '70px'
      },
      padding: {
        type: String,
        default: '5px 25px'
      },
      keys: Array,
      valueType: {
        type: String,
        default: 'string'
      }
    },
    computed: {
      stringValue () {
        switch (this.value) {
          case true:
            return '是'
          case false:
            return '否'
          default:
            return this.value
        }
      }
    },
    methods: {
      truncate (content) {
        return _.truncate(content, {length: 128})
      }
    }
  }
</script>

<style lang="less" scoped>
  @import '../../../style/variable';

  .config-item-value {
    width: 100%;
    display: flex;
    align-items: start;

    .item-label {
      width: 100px;
    }

    .item-label, .item-value {
      display: inline-block;
    }
  }

  .settings-table {
    min-width: 300px;
    td {
      border-right: 1px solid @border-color-split;
    }
  }

</style>

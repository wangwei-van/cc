<template>
  <div>
    <div v-for="opt in options"
         :key="opt.id"
         @click="onOptionClick(opt)"
         class="option-block"
         :class="{'option-selected': selectedId === opt.id}">
      <span>{{opt.value[0]}}c / {{opt.value[1]}} MiB</span>
      <div style="text-align: center; margin-top: -15px;">{{opt.label}}</div>
    </div>

    <div class="custom-block"
         :class="{'option-selected': selectedId === 3}"
         @click="onOptionClick(customOption)">
      <div class="option-title"><span>自定义</span></div>
      <InputNumber v-model="customOption.value[0]"
                   :step="0.5" :max="32" :min="0.1"
                   @on-change="emitChange">
      </InputNumber>
      <span style="margin-right: 5px;">核CPU</span>
      <InputNumber v-model="customOption.value[1]"
                   :step="128" :max="1024 * 4" :min="64"
                   @on-change="emitChange">
      </InputNumber>
      <span>MiB内存</span>
    </div>
  </div>

</template>

<script>
  import _ from 'lodash'

  export default {
    name: 'resource-select',
    props: {
      value: {
        type: Array,
        default: function () {
          return ['0.5', '256Mi']
        }
      },
    },
    data () {
      return {
        options: [
          {value: [0.5, 256], label: '最小', id: 0},
          {value: [1, 512], label: '适中', id: 1},
          {value: [2, 1024], label: '较大', id: 2},
        ],
        customOption: {value: [0.5, 512], id: 3},
        data: this.getNumberData(),
        selectedId: ''
      }
    },
    methods: {
      onOptionClick (option) {
        this.data = option.value
        this.selectedId = option.id
        this.emitChange()
      },
      emitChange () {
        const output = this.getStringData(this.data)
        this.$emit('input', output)
        this.$emit('on-change', output)
      },
      setSelectedId () {
        for (let option of this.options) {
          if (option.value[0] === this.data[0] && option.value[1] === this.data[1]) {
            this.selectedId = option.id
            return
          }
        }
        this.customOption.value = _.clone(this.data)
        this.selectedId = 3
      },
      getNumberData () {
        const toNumber = s => _.toNumber(s.replace(/[^.\d]/g, ''))
        return [
          this.value[0] ? toNumber(this.value[0]) : 0,
          this.value[1] ? toNumber(this.value[1]) : 0
        ]
      },
      getStringData () {
        return [
          `${this.data[0]}`,
          `${this.data[1]}Mi`,
        ]
      }
    },
    mounted () {
      this.setSelectedId()
    },
    watch: {
      value (newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal)) {
          this.data = this.getNumberData()
          this.setSelectedId()
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  @import '../../../style/variable';

  .option-block {
    display: inline-block;
    border: 1px solid @border-color-split;
    margin-right: 10px;
    padding: 3px 0 0;
    float: left;
    text-align: center;
    cursor: pointer;
    width: 127px;
  }

  .option-block.option-selected {
    border-color: @primary-color;
    background: lighten(@primary-color, 40%);
  }

  .custom-block {
    .option-block;
    width: 300px;

    padding: 10px 10px 10px 30px;
    position: relative;
    .option-title {
      position: absolute;
      left: 0;
      top: 0;
      width: 18px;
      height: 100%;
      background: @background-color-base;
      word-wrap: break-word;
      line-height: 16px;
      padding: 3px 2px;
    }
  }
  .custom-block.option-selected {
    border-color: @primary-color;
    .option-title {
      background: lighten(@primary-color, 40%);
    }
  }

</style>

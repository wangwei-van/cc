<template>
  <div>
    <div v-for="opt in options"
         :key="opt.value"
         class="option-card"
         @click="onClick(opt)"
         :class="{'option-card-selected': opt.value === selected, 'option-card-disabled': opt.disabled}">
      <div style="padding: 20px;">
        <div class="option-icon-box">
          <Icon :type="opt.iconType" class="option-icon"></Icon>
        </div>
      </div>

      <div class="option-context">
        <div class="option-title">{{opt.title}}</div>
        <div class="option-desc">
          <span v-if="!init || !imageName || opt.value !== 'image'">{{opt.desc}}</span>
          <Tooltip :content="imageName">
            <span v-if="init && imageName && opt.value === 'image'">{{ `通过镜像${truncate(imageName, 10)}创建` }}</span>
          </Tooltip>
        </div>
      </div>
      <Icon type="ios-checkmark-outline" v-if="opt.value === selected" class="option-selected-tip"></Icon>
    </div>
  </div>

</template>

<script>
  import _ from 'lodash'

  export default {
    name: 'card-radio-group',
    props: {
      options: {
        type: Array,
        default: []
      },
      value: String,
      init: Boolean
    },
    data () {
      return {
        selected: this.value,
        imageName: this.$route.params.imageName
      }
    },
    methods: {
      onClick (option) {
        if (option.disabled) return
        this.selected = option.value
        this.$emit('input', this.selected)
        this.$emit('on-change', this.selected)
      },
      truncate (content, maxLen){
        return _.truncate(content, {length: maxLen})
      }
    },
    watch: {
      value (newVal) {
        if (newVal !== this.selected) {
          this.selected = newVal
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  @import '../../../style/variable';

  @border-color: lightgrey;
  @selected-color: @primary-color;

  .option-card {
    cursor: pointer;
    position: relative;
    border: 1px solid @border-color;
    display: inline-block;
    border-radius: @border-radius-small;
    margin-left: 10px;
    text-align: center;
    min-width: 140px;
    color: @border-color;

    .option-icon-box {
      border-radius: 60px;
      display: inline-block;
      width: 60px;
      height: 60px;
      border: 1px solid @border-color;
      text-align: center;
      padding-top: 11px;

      .option-icon {
        font-size: 32px;
      }
    }
    .option-selected-tip {
      position: absolute;
      top: 5px;
      right: 5px;
      font-size: 16px;
    }
    .option-context {
      height: 60px;
      padding: 10px 0;
      background: @border-color;
    }
    .option-title {
      font-size: 14px;
      color: @text-color;
    }
    .option-desc {
      color: @text-color;
    }
  }
  .option-card.option-card-selected {
    border-color: @selected-color;
    color: @selected-color;
    .option-icon-box {
      border-color: @selected-color;
    }
    .option-context {
      background: tint(@selected-color, 10%);
    }
    .option-title, .option-desc {
      color: #fff;
    }
  }
  .option-card.option-card-disabled {
    cursor: not-allowed;
  }

</style>

<template>
  <div class="base-collapse" :class="{'base-collapse-collapsed': collapsed}">
    <div class="base-collapse-title">
      <div @click="onClickTitle">
        <span>{{title}}</span>
        <Icon type="ios-arrow-down" :style="{marginLeft: '5px'}" class="base-collapse-icon"></Icon>
      </div>
    </div>
    <CollapseTransition>
    <div v-show="!collapsed" :style="{padding}">
      <slot></slot>
    </div>
    </CollapseTransition>
  </div>
</template>

<script>
   /**
  * @说明: 折叠box
  * @params(title) 标题
  * @params(value) 是否为collapsed, 可用v-model
  * @params(padding) 内容区域padding, 默认 10px 0
  * @说明人: jrshale
  * @timestamp: 2018/07/06
  */


  import CollapseTransition from 'iview/src/components/base/collapse-transition';

  export default {
    name: 'base-collapse',
    components: {CollapseTransition},
    props: {
      title: String,
      value: {
        type: Boolean,
        default: false
      },
      padding: {
        type: String,
        default: '10px 0'
      }
    },
    data () {
      return {
        collapsed: this.value
      }
    },
    methods: {
      onClickTitle () {
        this.collapsed = !this.collapsed
        this.$emit('input', this.collapsed)
      }
    }
  }
</script>

<style lang="less" scoped>
  @import '../style/variable';

  .base-collapse {
    position: relative;
    margin-top: 15px;
    border-top: 1px solid @border-color-split;

    .base-collapse-title {
      width: 100%;
      text-align: center;
      position: relative;
      font-size: 14px;
      color: @title-color;
      top: -10px;
      user-select: none;

      & > div {
        cursor: pointer;
        display: inline-block;
        background: #fff;
        padding: 0 10px;
      }
    }
  }
  .base-collapse-collapsed {
    .base-collapse-icon {
      transform: rotate(90deg);
    }
  }
  .base-collapse-icon {
    transition: all .2s;
  }

</style>

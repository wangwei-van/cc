<template>
  <div class="input-button" @click="$emit('click')">
    <span class="placeholder-text" v-if="!value">{{placeholder}}</span>
    <span>{{value}}</span>
    <Icon :type="icon" v-if="icon" class="input-button-icon"></Icon>
  </div>

</template>

<script>
  export default {
    name: 'input-button',
    props: {
      value: String,
      placeholder: String,
      icon: String
    },
  }
</script>

<style lang="less" scoped>
  @import '../style/variable';

  .input-button {
    border: 1px solid @border-color-split;
    cursor: pointer;
    height: @input-height-base;
    padding: @input-padding-vertical-base @input-padding-horizontal;
    line-height: @input-height-base - @input-padding-vertical-base * 2 - 2;
    position: relative;

    .placeholder-text {
      color: @sub-text-color;
    }

    .input-button-icon {
      position: absolute;
      display: inline-block;
      line-height: @input-height-base;
      right: @input-padding-horizontal;
      top: 0;
    }

    &:hover{
      border-color: @primary-color;

       .input-button-icon {
         color: @primary-color;
       }
    }
  }


</style>

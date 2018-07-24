<template>
<Poptip placement="right-start"
        popper-class="popper-items"
        :value="value"
        transfer
        style="position: absolute; right: 0; top: 0;">
  <Menu slot="content"
        class="pop-menu"
        @mouseenter.native="mouseEnter"
        @mouseleave.native="mouseLeave">
    <div class="pop-menu-title">
      {{item.title}}
    </div>
    <a v-for="di in item.children"
            :key="di.name"
            class="pop-menu-item"
            :class="{'actived-item': $route.name === di.name}"
            @click="onItemSelect(di.name)">
      {{di.title}}
    </a>
  </Menu>
</Poptip>

</template>

<script>
export default {
  name: 'pop-menu',
  props: {
    item: Object,
    value: Boolean
  },
  methods: {
    onItemSelect (name) {
      this.$emit('on-select', name)
    },
    mouseEnter () {
      this.$emit('mouse-enter')
    },
    mouseLeave () {
      this.$emit('mouse-leave')
    }
  }
}

</script>

<style lang="less" scoped>
@import '../../style/variable';

.pop-menu-title {
  padding: 5px 20px 10px;
  color: @sub-text-color;
}
.pop-menu-item {
  display: block;
  width: 100%;
  padding: 10px 20px;
  color: black;
  &:hover {
    background: @background-color-select-hover;
  }
  &.actived-item {
    color: @primary-color;
  }
}

</style>

<style>
.popper-items .ivu-poptip-body {
  padding: 10px 0;
}
</style>

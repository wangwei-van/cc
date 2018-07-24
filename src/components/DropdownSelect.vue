<template>
  <Dropdown placement="bottom-start" @on-click="onClick" trigger="custom" :visible="opened" transfer>
    <a v-if="processing" disabled>提交中...</a>
    <a v-else href="javascript:void(0)" @click="handleOpen">
      {{value}}
      <Icon type="arrow-down-b"></Icon>
    </a>
    <DropdownMenu slot="list">
      <DropdownItem v-for="item in options" :key="item"
                    :selected="item === value" :name="item">
        {{item}}
      </DropdownItem>
    </DropdownMenu>
  </Dropdown>

</template>

<script>
  export default {
    name: 'dropdown-select',
    props: {
      value: String,
      options: Array,
      loading: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        processing: false,
        opened: false
      }
    },
    methods: {
      onClick (name) {
        this.opened = false
        if (this.value === name) return
        if (this.loading) {
          this.processing = true
          this.$emit('on-change', name)
        } else {
          this.$emit('input', name)
          this.$emit('on-change', name)
        }
      },
      handleOpen () {
        this.opened = true
      }
    },
    watch: {
      value () {
        this.processing = false
      }
    }
  }
</script>

<style lang="less" scoped>

</style>

<template>
  <ButtonGroup>
    <Button v-for="opt in showOptions" :key="opt.value"
            @click="onClick(opt.value)"
            :type="opt.type"
            :size="size" 
            style="margin-left: 3px;">
      {{opt.label}}
    </Button>
  </ButtonGroup>

</template>

<script>
  /***
   * @props:
   *   value: selected value
   *   options: [{value: 'xx', label: 'xxx'}, ...]
   *   size: button size,
   *   multiple: true/false 是否多选
   */

  export default {
    name: 'button-radio-group',
    props: {
      value: {
        type: [String, Array],
        default: null
      },
      options: {
        type: Array,
        default: () => []
      },
      size: {
        type: String,
        default: 'small'
      },
      multiple: {
        type: Boolean,
        default: false
      }
    },
    data () {
      let selected = this.value
      if (selected === null) {
        selected = this.multiple ? [] : ''
      }
      return {
        selected
      }
    },
    computed: {
      showOptions () {
        return this.options.map(opt => {
          let type = 'default'
          if (this.multiple && this.selected.indexOf(opt.value) > -1) {
            type = 'info'
          } else if (!this.multiple && this.selected === opt.value) {
            type = 'info'
          }
          return {
            ...opt,
            type
          }
        })
      }
    },
    methods: {
      onClick (val) {
        if (this.multiple) {
          const idx = this.selected.indexOf(val)
          if (idx > -1) {
            this.selected.splice(idx, 1)
          } else {
            this.selected.push(val)
          }
        } else {
          this.selected = val
        }
        this.$emit('input', this.selected)
        this.$emit('on-change', this.selected)
      }
    },
    watch: {
      value (newVal) {
        this.selected = newVal
      }
    }
  }
</script>

<style lang="less" scoped>

</style>

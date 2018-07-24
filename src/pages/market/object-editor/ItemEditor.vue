<template>
  <div>
    <i-input v-if="type === 'string'"
             :value="value"
             @input="onInput"
             class="form-input">
    </i-input>

    <input-number v-if="type==='number'"
                  :value="value"
                  @input="onInput"
                  class="form-input">
    </input-number>

    <BooleanRadioGroup v-if="type === 'boolean'"
                       :value="value"
                       @input="onInput">
    </BooleanRadioGroup>
  </div>

</template>

<script>
  import _ from 'lodash'
  import BooleanRadioGroup from './BooleanRadioGroup'

  export default {
    name: 'ItemEditor',
    components: { BooleanRadioGroup },
    props: {
      value: [String, Boolean, Number]
    },
    computed: {
      type () {
        if (_.isString(this.value)) {
          return 'string'
        } else if (_.isBoolean(this.value)) {
          return 'boolean'
        } else if (_.isNumber(this.value)) {
          return 'number'
        }
        return 'string'
      }
    },
    methods: {
      onInput (val) {
        this.$emit('input', val)
        this.$emit('on-change', val)
      }
    }
  }
</script>

<style lang="less" scoped>
  .form-input {
    width: 300px;
  }

</style>

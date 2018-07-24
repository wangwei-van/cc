<template>
  <RadioGroup :value="valueLabel" @input="handleChange" class="boolean-radio-group">
    <Radio label="true"></Radio>
    <Radio label="false"></Radio>
  </RadioGroup>

</template>

<script>
  export default {
    name: 'BooleanRadioGroup',
    props: {
      value: Boolean
    },
    computed: {
      valueLabel () {
        return this.value + ''
      }
    },
    methods: {
      handleChange (val) {
        this.$emit('input', val === 'true')
        this.$emit('on-change', val === 'true')
      }
    }
  }
</script>

<style lang="less">
  .boolean-radio-group .ivu-radio-inner:after {
    display: block;
  }

</style>

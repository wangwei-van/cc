<template>
  <div class="list-box">
     <div v-for="(item, idx) in data" :key="idx">
       <i-input v-model="data[idx]" class="form-input" @on-change="handleChange"></i-input>
       <Icon type="minus-circled" @click.native="handleRemove(idx)" class="remove-icon"></Icon>
     </div>
     <Button class="list-add-btn" icon="plus" @click="handleAdd"></Button>
  </div>
</template>

<script>
  import _ from 'lodash'

  export default {
    name: 'ListEditor',
    props: {
      value: Array
    },
    data () {
      return {
        data: _.cloneDeep(this.value)
      }
    },
    methods: {
      handleRemove (idx) {
        this.data.splice(idx, 1)
        this.handleChange()
      },
      handleAdd () {
        this.data.push('')
        this.handleChange()
      },
      handleChange () {
        this.$emit('input', this.data)
        this.$emit('on-change', this.data)
      }
    },
    watch: {
      value (val) {
        if (!_.isEqual(val, this.data)) {
          this.data = _.cloneDeep(val)
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  @import '../../../style/variable';

  .list-box {
    border: 1px dashed @border-color-split;
    padding: 10px;
    /*width: 322px;*/
  }
  .form-input {
    width: 300px;
    margin-bottom: 10px;
  }
  .list-add-btn {
    width: 300px;
  }
  .remove-icon {
    font-size: 14px;
    margin-left: 5px;
    cursor: pointer;
    position: relative;
    top: -3px;

  }

</style>

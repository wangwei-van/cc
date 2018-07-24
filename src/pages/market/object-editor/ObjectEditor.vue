<template>
  <div>
    <template v-if="topComment && comment[commentPrefix]">
      <p v-for="item in comment[commentPrefix]" class="comment-text">{{item}}</p>
    </template>
    <table style="border-collapse:separate; border-spacing:10px 10px; margin-bottom: 0px;">
      <template v-for="(obj, field) in data">
        <tr v-if="isArray(obj)" :key="field">
          <td style="vertical-align: top; text-align: right;">{{field}} :</td>
          <td>
            <ListEditor v-model="data[field]" @on-change="handleChange"></ListEditor>
          </td>
        </tr>

        <tr v-else-if="isObject(obj)" :key="field">
          <td style="vertical-align: top; text-align: right;">{{field}} :</td>
          <td>
            <div class="object-box">
              <ObjectEditor v-model="data[field]"
                            :comment-prefix="`${commentPrefix}.${field}`"
                            :comment="comment"
                            @on-change="handleChange">
              </ObjectEditor>
            </div>
          </td>
        </tr>
        <tr v-else :key="field">
          <td style="text-align: right;">
            <Poptip v-if="comment[commentPrefix + '.' + field]" placement="top" transfer>
              <Icon type="information-circled" style="cursor: pointer;"></Icon>
              <div slot="content">
                <p v-for="item in comment[commentPrefix + '.' + field]">{{item}}</p>
              </div>
            </Poptip>
            <span>{{field}} : </span>
          </td>
          <td>
            <ItemEditor v-model="data[field]" :key="field" @on-change="handleChange"></ItemEditor>
          </td>
        </tr>
      </template>
    </table>
  </div>

</template>

<script>
  import _ from 'lodash'
  import ItemEditor from './ItemEditor'
  import ListEditor from './ListEditor'

  export default {
    name: 'ObjectEditor',
    components: { ItemEditor, ListEditor },
    props: {
      value: Object,
      comment: {
        type: Object,
        default: () => ({})
      },
      commentPrefix: String,
      topComment: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        data: _.cloneDeep(this.value)
      }
    },
    methods: {
      isObject (obj) {
        return _.isObject(obj)
      },
      isArray (obj) {
        return _.isArray(obj)
      },
      handleChange () {
        this.$emit('input', this.data)
        this.$emit('on-change', this.data)
      }
    },
    watch: {
      value (newVal) {
        if (!_.isEqual(newVal, this.data)) {
          this.data = newVal
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  @import '../../../style/variable';

  .object-box {
    border: 1px dashed @border-color-split;
  }
  .comment-text {
    color: @sub-text-color;
    margin-left: 10px;
  }

</style>

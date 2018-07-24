/**
 * @说明: 对象数组数据的增删改mixins，默认会显示一组空数据，对应parsValidator表单验证函数（数据length为1时不进行校验）。
 *        若想保证子组件value和data始终一致，handleChange直接传data值，并且添加对value的监听；否则可以使value和data不一致
 *        表单提交时，若最后一组数据不能通过校验，则需要将其移除
 * @说明人: jrwangwei3
 * @timestamp: 2018/07/02
 */
import _ from 'lodash'

const parSettingMixin = {
  methods: {
    handleChange () {
      this.$emit('input', this.data)
      this.$emit('on-change', this.data)
    },
    handleRemove (index) {
      if (this.data.length === 1) {
        this.data = [this.getEmptyRow()]
      } else {
        this.data.splice(index, 1)
      }
      this.handleChange()
    },
    handleAdd () {
      this.data.push(this.getEmptyRow())
      this.handleChange()
    },
    getEmptyRow () {
      return _.zipObject(this.keys, _.repeat('', this.keys.length))
    }
  }
}

export {
  parSettingMixin

}

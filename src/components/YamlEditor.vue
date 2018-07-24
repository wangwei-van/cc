<template>
  <div class="yaml-editor"
       :id="id"
       :style="{
          width: typeof(width) === 'number' ? width + 'px' : width,
          height: typeof(height) === 'number' ? height + 'px' : height,
       }">
  </div>
</template>

<script>
import * as ace from 'brace'
import 'brace/mode/yaml'
import 'brace/theme/chrome'
import _ from 'lodash'

let count = 0;

export default {
  name: 'YamlEditor',
  props: {
    value: {
      type: String,
      default: ''
    },
    width: {
      type: [Number, String],
      default: '100%'
    },
    height: {
      type: [Number, String],
      default: 300
    }
  },
  data () {
    return {
      id: `code-editor-${count ++}`,
      editor: null
    }
  },
  methods: {
    init () {
      this.editor = ace.edit(this.id)
      this.editor.$blockScrolling = Infinity
      this.editor.setValue(this.value)
      this.editor.getSession().setMode('ace/mode/yaml')
      this.editor.setTheme('ace/theme/chrome')
      this.editor.setOptions({
        showPrintMargin: false
      })
      this.editor.clearSelection()
      this.editor.getSession().on('change', _.debounce(
        (event, session) => {
          this.$emit('input', session.getValue())
        }, 200)
      )
    },
    getContent () {
      return this.editor.getValue()
    },
  },
  mounted () {
    this.init()
  },
  beforeDestroy () {
    if (!this.editor) return
    this.editor.destroy()
    this.editor.container.remove()
  },
  watch: {
    value (newVal, oldVal) {
      if (!_.isEqual(newVal, this.getContent())) {
        this.editor.setValue(this.value)
        this.editor.clearSelection()
      }
    }
  }
}
</script>

<style scoped>
  .code-editor {
    /*position: absolute;*/
  }

</style>

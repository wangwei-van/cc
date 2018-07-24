<template>
  <pre :style="boxStyle" :class="{'line-numbers': lineNumbers}">
    <code :class="codeClass">{{text}}</code>
  </pre>
</template>

<script>
  import Prism from 'prismjs'
  import 'prismjs/themes/prism-coy.css'
  import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
  const loadLanguages = require('prismjs/components/index.js');
  import 'prismjs/plugins/line-numbers/prism-line-numbers.js'
  loadLanguages(['yaml', 'json'])

  export default {
    name: 'code-box',
    props: {
      lang: String,
      text: String,
      height: String,
      lineNumbers: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {

      }
    },
    computed: {
      codeClass () {
        return 'language-' + this.lang
      },
      boxStyle () {
        const style = {}
        if (this.height) style.height = this.height
        return style
      }
    },
    mounted () {
      const targetDom = this.$el.getElementsByTagName('code')[0]
      Prism.highlightElement(targetDom)
    }
  }
</script>

<style lang="less" scoped>

</style>

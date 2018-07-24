<template>
  <canvas :height="height" :width="width"></canvas>
</template>

<script>
  /* @说明: 弧形
   * @params(height) 图形高度，注：使用style会定义宽高，图形会变形
   * @params(width) 图形宽度，注：使用style会定义宽高，图形会变形
   * @params(data) 定义了每段弧形的数值和颜色
   * @params(options) 图形配置参数
   * @说明人: jrwangwei3
   * @时间: 2018/07/02
   */
  import _ from 'lodash'

  export default {
    name: 'ArchChart',
    props: {
      data: {
        type: Array,
        default: () => {
          return []
        }
      },
      options: {
        type: Object,
        default: () => ({
          lineWidth: 1,
          lineCap: 'butt',
          miterLimit: 10
        })
      },
      height: Number,
      width: Number
    },
    computed: {
      centerX () {
        return this.width/2
      },
      centerY () {
        return 3*this.height/4
      },
      radius () {
        return Math.min(parseInt(this.width), parseInt(this.height))/2 - this.options.lineWidth/2
      }
    },
    methods: {
      drawCircle (x, y, radius, startAngle, endAngle, strokeColor) {
        // 从180度起开始画
        this.ctx.lineWidth = this.options.lineWidth
        this.ctx.lineCap = this.options.lineCap
        this.ctx.miterLimit = this.options.miterLimit
        startAngle += Math.PI
        endAngle += Math.PI
        this.ctx.moveTo(x,y)
        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.strokeStyle = strokeColor
        this.ctx.arc(x, y, radius, startAngle, endAngle, false)
        this.ctx.stroke()
        this.ctx.closePath()
        this.ctx.restore()
      },
      draw () {
        let start =0, end = 0, lastEnd = 0, total=0
        _.forEach(this.data, option => {
          total += option.value
        })
        if (total === 0) {
          this.drawCircle(this.centerX, this.centerY, this.radius, 0, Math.PI, '#eee')
        }
        _.forEach(this.data, (option, index) => {
          if (option.value != 0) {
            end = option.value*Math.PI + lastEnd*Math.PI
            this.drawCircle(this.centerX, this.centerY, this.radius, start, end, option.color)
            start = end
            lastEnd += option.value
          }
        })
      }
    },
    watch: {
      data (newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal)) {
          this.ctx.clearRect(0, 0, this.width, this.height)
          this.draw()
        }
      }
    },
    mounted () {
      this.ctx = this.$el.getContext('2d')
      this.draw()
      this.onresize = () => {
        this.ctx.clearRect(0, 0, this.width, this.height)
        this.draw()
      }
      window.addEventListener('resize', this.onresize)
    },
    beforeDestroy () {
      window.removeEventListener('resize', this.onresize)
    }
  }
</script>

<style lang="less" scoped>
</style>
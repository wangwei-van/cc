<template>
  <div class="spark"></div>
</template>

<script>
  /**
   * @说明: 在表格或者其他地方使用的小图lineChart，使用raphael.js插件（暂未使用）
   * @params(data): 数组数据，图形根据该数据进行展示
   * @params(height): 图形高度
   * @params(width): 图形高度
   * @params(options): 图形配置参数，如背景颜色、线条颜色等
   * @说明人: jrwangwei3
   * @timestamp: 2018/07/02
   */
  import Raphael from 'raphael'

  export default {
    name: 'spark-line',
    props: {
      data: Array,
      height: {
        type: Number,
        default: 15
      },
      width: {
        type: Number,
        default: 60
      },
      options: {
        type: Object,
        default: () => {
          return {
            strokeColor: 'rgba(11, 219, 168, 1)',
            fillColor: 'rgba(11, 219, 168, 0.2)'
          }
        }
      }
    },
    data () {
      return {
        paper: null,
        path: ''
      }
    },
    methods: {
      getPoints () {
        const max = Math.max.apply(null, this.data)

        // 若所有数据均为0，则显示矩形
        if (max === 0) {
          return [
            {x:0, y: parseFloat(this.height)},
            {x: this.width, y: parseFloat(this.height)},
          ]
        } else {
          const len = this.data.length
          const xRate = this.width / (len - 1)
          const yRate = this.height / max

          let res = []
          _.forEach(this.data, (item, idx) => {
            res.push({
              x: idx * xRate,
              y: item * yRate
            })
          });

          return res
        }
      }, 
      getPath (points) {
        const path = []
        _.forEach(points, (point, idx) => {
          path.push((idx === 0) ? 'M' : 'L', point.x, ',', point.y)
        })
        return path.join(' ')
      },
      // 画area闭合区域，即浅色背景
      drawFill () {
        let points = this.getPoints()
        points.unshift({x: 0, y: 0})
        points.push({x: this.width, y: 0})

        this.paper.path(this.getPath(points)).attr({
          stroke: this.options.fillColor,
          fill: this.options.fillColor
        })
      },
      drawPath () {
        const max = Math.max.apply(null, this.data)
        let path = ''
        // 当数据都为0时，实际线条在最下面
        if (max === 0) {
          path = this.getPath([{x: 0, y: 0}, {x: this.width, y: 0}])
        } else {
          path = this.getPath(this.getPoints())
        }
        this.path = this.paper.path(path)
          .attr({
            stroke: this.options.strokeColor,
          })
      }
    },
    mounted () {
      this.paper = Raphael(this.$el, this.width, this.height)
      this.drawFill()
      this.drawPath()
    },
    watch: {
      data: () => {
        this.path.attr({path: this.getPath(this.getPoints)})
      }
    }
  }
</script>

<style lang="less" scoped>
  .spark {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    transform: rotateX(180deg)
  }
</style>

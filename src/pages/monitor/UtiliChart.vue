<template>
  <div :style="{height: '300px', width: '100%'}"></div>

</template>

<script>
  export default {
    name: "UtiliChart",
    props: {
      data: {
        type: Array,
        default: () => []
      },
      title: String,
      color: {
        type: Array,
        default: () => [88,160,253]
      } // rgb
    },
    data () {
      return {
        chart: null,
        options: {
          title: {
            text: this.title,
            left: 'center'
          },
          grid: {
          //   top: 160,
            bottom: 20
          },
          xAxis: {
            type: 'time',
            axisLabel: {
              show: false,
            },
            splitLine: {
              lineStyle: {
                color: '#ddd'
              }
            }
          },
          yAxis: {
            type: 'value',
            max: 100,
            min: 0
          },
          series: [{
            data: this.data,
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            symbolSize: 10,
            areaStyle: {
              normal: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                    // offset: 0, color: 'rgba(88,160,253,1)'
                    offset: 0, color: `rgba(${this.color.join(',')},1)`
                  }, {
                    offset: 0.5, color: `rgba(${this.color.join(',')},0.7)`
                  }, {
                    offset: 1, color: `rgba(${this.color.join(',')},0)`
                  }]
                }
              }
            },
            lineStyle: {
              normal: {
                color: `rgba(${this.color.join(',')},1)`
              }
            },
            itemStyle: {
              normal: {
                color: `rgba(${this.color.join(',')},1)`
              }
            },
          }]
        }
      }
    },
    watch: {
      data (newVal) {
        if (this.chart) {
          this.chart.setOption({
            series: [{
              data: newVal
            }]
          })
        }
      }
    },
    mounted () {
      setTimeout(() => {
        this.chart = echarts.init(this.$el)
        this.chart.setOption(this.options)
        this.onresize = _.debounce(() => {
          this.chart.resize()
        }, 500)
        window.addEventListener('resize', this.onresize)
      }, 0)
    },
    beforeDestroy () {
      window.removeEventListener('resize', this.onresize)
    }
  }
</script>

<style scoped lang="less">

</style>

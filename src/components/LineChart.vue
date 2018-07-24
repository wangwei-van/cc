<template>
  <div :style="{height: chartHeight, position: 'relative', width: chartWidth}">
    <div :style="{height: chartHeight, width: chartWidth}"></div>
    <div class="empty-tips" v-if="!loading && isEmpty">暂无数据</div>
    <Spin class="loading" size="large" v-if="loading"></Spin>
  </div>
</template>

<script>
  /*
   * @说明: 折线图
   * @params(data) 图表数据，格式为{x: x轴数据, y: y轴数据}
   * @params(chartHeight) 图表高度，默认'300px'
   * @params(chartWidth) 图表宽度，默认'100%'
   * @params(unit) y轴数据单位（比如%、Mb等）
   * @params(title) 图表标题
   * @说明人: jrwangwei3
   * @timestamp: 2018/07/02
   */
  import dayjs from 'dayjs'
  import _ from 'lodash'

  export default {
    name: "LineChart",
    props: {
      data: {
        type: Object,
        default: () => {}
      },
      loading: {
        type: Boolean,
        default: false
      },
      chartHeight: {
        type: String,
        default: '300px'
      },
      chartWidth: {
        type: String,
        default: '100%'
      },
      unit: String,
      title: String,
      color: {
        type: Array,
        default: () => [88,160,253]
      }, // rgb
      extraOption: {
        type: Object,
        default: () => ({})
      }
    },
    data () {
      const options = _.merge({
        title: {
          text: this.title,
          left: 'center',
          textStyle:{
            fontFamily: 'MicrosoftYaHei',
            fontWeight: 400,
            fontSize: 16,
            color: '#858B9D'
          }
        },
        grid: {
          left: 60
        },
        tooltip: {
          trigger: 'axis',
          formatter: (function (obj) {
            const unit = this.unit
            const time =  dayjs(new Date(obj[0].name)).format('YYYY/MM/DD HH:mm:ss')
            let str = `时间：${time}`
            _.forEach(obj, function (item) {
              str += `</br>${item.seriesName}：${(item.value === 0 || item.value === 100) ? item.value : parseFloat(item.value).toFixed(2)}${unit}`;
            })
            return str
          }).bind(this)
        },
        xAxis: {
          type: 'category',
          data: this.data.x,
          boundaryGap: false,
          splitLine: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#858B9D'
            }
          },
          axisLabel: {
            formatter: function (value) {
              return dayjs(new Date(value)).format('HH:mm:ss')
            }
          }
        },
        yAxis: {
          type:'value',
          name: (function (obj) {
            if (obj.unit !== '%') return obj.unit
          })(this),
          axisLabel: {
            formatter: (function (value) {
              const unit = this.unit
              if (unit === '%') return `${value}${unit}`
              return value
            }).bind(this)
          },
          axisLine: {
            lineStyle: {
              color: '#858B9D'
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        series: [{
          data: this.data.y,
          name: this.title,
          type: 'line',
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
      }, this.extraOption)

      return {
        chart: null,
        options
      }
    },
    computed: {
      isEmpty () {
        return this.data.y.length === 0
      }
    },
    watch: {
      data (newVal) {
        if (this.chart) {
          this.chart.setOption(_.merge({}, this.options, {
            xAxis: [{data: newVal.x}],
            series: [{data: newVal.y}]
          }))
        }
      }
    },
    mounted () {
      this.chart = echarts.init(this.$el.childNodes[0])
      this.chart.setOption(this.options)
      this.onresize = _.debounce(() => {
        this.chart.resize()
      }, 500)
      window.addEventListener('resize', this.onresize)
    },
    beforeDestroy () {
      window.removeEventListener('resize', this.onresize)
    }
  }
</script>

<style scoped lang="less">
  .empty-tips, .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
  }
  .empty-tips {
    font-size: 16px;
    opacity: 0.7;
  }
</style>

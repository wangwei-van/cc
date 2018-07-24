<template>
  <div :style="{height: chartHeight, position: 'relative', width: chartWidth}">
    <div :style="{height: chartHeight, width: chartWidth}"></div>
    <div class="empty-tips" v-if="!loading && isEmpty">暂无数据</div>
    <Spin class="loading" size="large" v-if="loading"></Spin>
  </div>
</template>

<script>
  import dayjs from 'dayjs'
  import _ from 'lodash'

  const TitleStyle = {
    fontFamily: 'MicrosoftYaHei',
    fontWeight: 400,
    fontSize: 16,
    color: '#858B9D'
  }
  const AxisLineStyle = {
    lineStyle: {
      color: '#858B9D'
    }
  }
  const splitLine = {
    lineStyle: {
      type: 'dashed'
    }
  }

  const OPTION = {
    color: ['#0099ff', '#c23531', '#749f83'],
    title: [
      {left: '20%', text: 'CPU 使用率 (%)', textStyle: TitleStyle},
      {left: '70%', text: '内存 使用率 (%)', textStyle: TitleStyle},
      {left: '20%', top: '50%', text: '入流量 (byte/s)', textStyle: TitleStyle},
      {left: '70%', top: '50%', text: '出流量 (byte/s)', textStyle: TitleStyle},
    ],
    xAxis: [
      {axisLine: AxisLineStyle, type: 'time', splitLine: {show: false}},
      {gridIndex: 1, axisLine: AxisLineStyle, type: 'time', splitLine: {show: false}},
      {gridIndex: 2, axisLine: AxisLineStyle, type: 'time', splitLine: {show: false}},
      {gridIndex: 3, axisLine: AxisLineStyle, type: 'time', splitLine: {show: false}},
    ],
    yAxis: [
      {splitLine, axisLine: AxisLineStyle, max: 100},
      {splitLine, gridIndex: 1, axisLine: AxisLineStyle, max: 100},
      {splitLine, gridIndex: 2, axisLine: AxisLineStyle},
      {splitLine, gridIndex: 3, axisLine: AxisLineStyle},
    ],
    grid: [
      {left: '5%', bottom: '60%', right: '55%'},
      {left: '55%', bottom: '60%', right: '5%'},
      {left: '5%', top: '60%', right: '55%'},
      {left: '55%', top: '60%', right: '5%'},
    ],
    tooltip: {
      trigger: 'axis',
      formatter: (function (obj) {
        let str = '时间：'
        str += dayjs(new Date(obj[0].data[0])).format('YYYY/MM/DD HH:mm:ss')
        _.forEach(obj, function (item) {
          str += '</br>'
          str += `${item.marker}${item.seriesName}：${_.round(item.data[1], 2)} ${item.axisIndex >= 2 ? 'byte/s' : '%'}`;
        })
        return str
      })
    },
  }

  export default {
    name: "MultiLineChart",
    props: {
      data: {
        type: Object,
        default: () => ({})
      },
      loading: {
        type: Boolean,
        default: false
      },
      chartHeight: {
        type: String,
        default: '600px'
      },
      chartWidth: {
        type: String,
        default: '100%'
      }
    },
    data () {
      return {
        chart: null,
        fields: ['cpu_utili', 'mem_utili', 'network_rx_rate', 'network_tx_rate']
      }
    },
    computed: {
      isEmpty () {
        return _.isEmpty(this.data)
      }
    },
    methods: {
      getOption () {
        const option = _.cloneDeep(OPTION)
        if (!_.isEmpty(this.data)) {
          option.series = this.getSeries()
        }
        return option
      },
      getSeries () {
        const series = []
        for (let pod in this.data) {
          if (!this.data.hasOwnProperty(pod)) continue
          const data = this.data[pod]
          this.fields.map((field, idx) => {
            series.push({
              name: pod,
              data: data.map(item => [item.timestamp, item[field]]),
              type: 'line',
              xAxisIndex: idx,
              yAxisIndex: idx
           })
          })
        }
        return series
      }
    },
    watch: {
      data (newVal) {
        if (this.chart) {
          this.chart.setOption(this.getOption(), {notMerge: true})
        }
      }
    },
    mounted () {
      setTimeout(() => {
        this.chart = echarts.init(this.$el.childNodes[0])
        this.chart.setOption(this.getOption())
      }, 0)
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

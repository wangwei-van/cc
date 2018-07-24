<template>
  <div style="height: 100px; width: 100%"></div>
</template>

<script>
import {COLORS} from '@/pars'
import _ from "lodash";

export default {
  name: "Liquid-chart",
  props: {
    data: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      chart: null,
      options: {
        series: [
          {
            color: [COLORS.operating],
            data: this.data,
            type: "liquidFill",
            radius: '85%',
            center: ["45%", "45%"],
            // backgroundStyle: {
              // borderColor: "#66cccc",
              // borderWidth: 1,
              // shadowColor: "rgba(0, 0, 0, 0.4)",
              // shadowBlur: 10
            // },
            label: {
              color: COLORS.operating,
              fontSize: 30
            },
            outline: {
              show: false
            },
            waveAnimation: true
          }
        ]
      }
    };
  },
  watch: {
    data(newVal) {
      if (this.chart) {
        this.chart.setOption(_.merge({}, this.options, {
          series: [{
            data: newVal
          }]
        }))
      }
    }
  },
  mounted() {
    this.chart = echarts.init(this.$el);
    this.chart.setOption(this.options);

    this.onresize = () => {
      this.chart.resize()
    };
    window.addEventListener("resize", this.onresize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onresize);
  }
};
</script>

<style lang="less" scoped>
</style>
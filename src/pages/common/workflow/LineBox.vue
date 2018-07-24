<template>
  <svg width="100%"
       height="100%"
       version="1.1"
       xmlns="http://www.w3.org/2000/svg" style="margin-left: 100px; margin-top: 100px;">
    <defs>
      <marker id="arrow"
              markerUnits="strokeWidth"
              markerWidth="12"
              markerHeight="12"
              viewBox="0 0 12 12"
              refX="6"
              refY="6"
              orient="auto">
        <path d="M2,2 L10,6 L2,10 L6,6 L2,2" :style="{fill: color}" ></path>
      </marker>
    </defs>

    <line x1="M0" y1="0" x2="200" y2="100"
          stroke-dasharray="5,3"
          :stroke="color"
          stroke-width="1"
          marker-end="url(#arrow)">
    </line>
</svg>

</template>

<script>
  export default {
    name: 'line-box',
    props: {
      color: {
        type: String,
        default: 'grey'
      }

    }
  }
</script>

<style lang="less" scoped>

</style>

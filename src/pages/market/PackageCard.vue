<template>
  <div class="image-card" @click="$emit('click')">
    <div class="icon-container">
      <img :src="iconUrl" class="icon-img">
    </div>
    <div class="info-container">
      <div>
        <h2>{{info.name}}</h2>
        <a href="">{{info.version}}</a>
      </div>
      <div style="text-align: right; width: 100%; clear: both;">
        <Tag :color="tagColor" style="margin-right: 0;">{{info.repository}}</Tag>
      </div>
    </div>
  </div>
</template>

<script>
  import {COLORS} from "@/pars";

  export default {
    name: 'image-card',
    props: {
      info: Object
    },
    computed: {
      tagColor () {
        return {
          'stable': COLORS.info,
          'incubator': COLORS.warning
        }[this.info.repository]
      },
      iconUrl () {
        return `/helm/assets/${this.info.name}-${this.info.version}.png`
      }
    }
  }
</script>

<style lang="less" scoped>
  @import '../../style/variable';

  .image-card {
    cursor: pointer;
    width: 290px;
    margin: 0 25px 25px 0;
    box-shadow: 0 3px 6px rgba(28,43,57,.4);
    display: inline-block;
    .icon-container {
      height: 100px;
      background: @border-color-base;
      display: flex;
      justify-content: center;
      align-items:center;
      .icon-img {
        max-height: 72px;
      }
    }
    .info-container {
      background: white;
      padding: 10px;
      h2 {
        display: inline-block;
      }
      a {
        float: right;
        line-height: 28px;
      }
    }

  }

</style>

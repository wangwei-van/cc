<template>
  <div>
    <div v-for="(rule, idx) in ruless" :key="idx" class="ingress-rule">
      <div class="host">{{ rule.host }}</div>
      <div class="path">
        <div v-for="(path, idx) in rule.http.paths" :key="idx" class="item">
          <span>{{ path.path || '--' }}</span>
          <span>{{ `${path.backend.serviceName} : ${path.backend.servicePort}` }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ingress-rules',
    props: {
      rules: Array
    },
    data () {
      return {
        ruless: this.rules
      }
    }
  }
</script>

<style lang="less" scoped>
  .ingress-rule {
    display: flex;
    padding: 5px 0;
    .host {
      width: 200px
    }
    .path {
      display: flex;
      flex-direction: column;
      .item {
        margin-bottom: 10px;
        &:first-child {
          margin-bottom: 0;
        }
        span {
          display: inline-block;
          &:first-child {
            width: 200px
          }  
        }
      }
    }
  }
</style>

<template>
  <DataTable :columns="cols"
              size="small"
              stripe
              :data="histories">
  </DataTable>
</template>

<script>
  export default {
    name: 'approval-history',
    props: {
      histories: Array
    },
    data () {
      return {
        cols: [
          {key: 'action', title: '操作'},
          {key: 'quotapod', title: 'Pod'},
          {key: 'quotacpu', title: 'Cpu'},
          {key: 'quotamem', title: '内存'},
          {key: 'quotapvc', title: '存储卷'},
          {key: 'quotastorage', title: '存储空间'},
          {key: 'createtime', title: '操作时间'},
        ]
      }
    }
  }
</script>

<style lang="less" scoped>
</style>


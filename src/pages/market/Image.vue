<template>
  <div>
    <Breadcrumb class="custom-breadcrumb">
      <BreadcrumbItem>市场</BreadcrumbItem>
      <BreadcrumbItem>镜像仓库</BreadcrumbItem>
    </Breadcrumb>
    <Tabs type="card" v-model="tabName" :animated="false" class="custom-tabs">
      <TabPane label="公有镜像" name="public-image-list" class="">
        <ImageList type="public" v-if="tabName === 'public-image-list'"></ImageList>
      </TabPane>
      <TabPane label="用户镜像" name="private-image-list">
        <ImageList type="private" v-if="tabName === 'private-image-list'"></ImageList>
      </TabPane>
    </Tabs>   
  </div>
</template>

<script>
  import ImageList from './ImageList'

  export default {
    name: 'market-image-list',
    components: {ImageList},
    props: {
      cluster: String,
      namespace: String
    },
    data () {
      return {
        tabName: 'public-image-list',
        loading: true,
      }
    },
    methods: {
      
    },
    mounted () {
    }
  }
</script>

<style lang="less" scoped>

</style>

<template>
  <div v-back-to.parent>
    <div class="table-toolbar clearfix">
      <i-input v-model="searchText"
                @on-enter="search"
                placeholder="请输入关键字搜索"
                icon="search"
                style="width: 200px; float: right;">
      </i-input>
    </div>
    <div v-for="(item, index) in images" :key="item" class="image-item" :class="{first: index === 0}">
      <i class="image-pic"></i>
      <span v-text="item"></span>
      <Button type="info" @click="createDeployment(item)">创建应用</Button>
    </div>
    <infinite-loading @infinite="infiniteHandler" ref="infiniteLoading">
      <span slot="no-more"></span>
      <p slot="no-results" style="text-align: center">暂无镜像</p>
    </infinite-loading>

  </div>
</template>

<script>
  import InfiniteLoading from 'vue-infinite-loading'

  export default {
    name: 'image-list',
    components: {InfiniteLoading},
    props: {
      type: String
    },
    data () {
      return {
        images: [],
        searchText: '',
        limits: this.type === 'public' ? 20 : 1000
      }
    },
    computed: {
      cluster () {
        return this.$route.params.cluster
      },
      namespace () {
        return this.$route.params.namespace
      }
    },
    methods: {
      loadData () {
        const params = {
          n: this.limits,
          scope: this.type,
        }
        if (this.images.length > 0) {
          params.last = _.last(this.images)
        }
        if (this.searchText) {
          return this.$api.image.searchImage(this.searchText)
            .then(res => {
              return [res.data.name]
            })
        }
        return this.$api.image.listImage(params)
          .then(res => {
            return res.data.repositories
          })
      },
      infiniteHandler ($state) {
        this.loadData()
        .then(res => {
          if (this.type === 'private') {
            res = _.filter(res, image => {
              return _.startsWith(image, `${this.namespace}/`)
            })
          }
          this.images = this.images.concat(res)
          if (this.type === 'private') {
            $state.loaded();
            $state.complete()
            return
          }
          if (res.length < this.limits ) {
            $state.loaded();
            $state.complete();
          } else {
            $state.loaded();
          }
        }).catch(err => {
          this.images = []
          $state.complete()
        })
      },
      search () {
        this.images = []
        this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset')
      },
      createDeployment (imageName) {
        this.$router.push({
          name: 'deploy-deployment-create',
          params: {
            ...this.$route.params,
            imageName
          }
        })
      }
    },
    watch: {
      $route () {
        this.images = []
        this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset')
      } 
    }
  }
</script>

<style lang="less" scoped>
  .image-item {
    position: relative;
    border: 1px solid #eee;
    border-top: 0;
    padding: 5px 10px;
    &.first {
      border-top: 1px solid #eee;
      margin-top: 10px;
    }
  }
  .image-pic {
    display: inline-block;
    width: 80px;
    height: 60px;
    background-image: url(../../assets/images/logo.png);
    background-repeat : no-repeat;
    background-position: center center;
    vertical-align: middle;
  }
  button {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
  }
</style>

<template>
  <Modal v-model="visible" width="600" title="选择镜像">
    <div class="dialog-body">
      <Tabs type="card" :animated="false" v-model="scope">
        <TabPane label="公有" name="public">
          <div class="image-list" v-back-to>
            <div v-for="item in imageList.public" :key="item" class="image-item">
              <i :class="'image-pic image-' + getImageName(item)"></i>
              <span v-text="item"></span>
              <Button type="info" @click="onItemClick(item)" style="float: right;">选择</Button>
            </div>
            <infinite-loading @infinite="infinitePublic" ref="publicInfinit">
              <span slot="no-more"></span>
            </infinite-loading>
          </div>
        </TabPane>
        <TabPane label="私有" name="private">
          <div class="image-list" v-back-to>
            <div v-for="item in imageList.private" :key="item" class="image-item">
              <i :class="'image-pic image-' + getImageName(item)"></i>
              <span v-text="item"></span>
              <Button type="info" @click="onItemClick(item)" style="float: right;">选择</Button>
            </div>
            <infinite-loading @infinite="infinitePrivate" ref="privateInfinit">
              <span slot="no-more"></span>
            </infinite-loading>
          </div>
        </TabPane>
      </Tabs>
      <i-input v-model="inputText"
               icon="search"
               placeholder="请输入名称搜索"
               slot="extra"
               @on-enter="onSearch"
               class="dialog-search-input">
      </i-input>
    </div>
    <div slot="footer"></div>
  </Modal>

</template>

<script>
  import InfiniteLoading from 'vue-infinite-loading'
  import _ from 'lodash'

  export default {
    name: 'select-image-dialog',
    components: { InfiniteLoading },
    props: {
      value: {
        type: Boolean,
        default: false
      },
      prefix: {
        type: String,
        default: 'gcr.io/'
      }
    },
    data () {
      return {
        visible: this.value,
        inputText: '',
        scope: 'public',
        imageList: {
          public: [],
          private: []
        },
        queryNum: 20,
        infinitePublic: this.infiniteFactory('public'),
        infinitePrivate: this.infiniteFactory('private'),
        searchText: {
          public: '',
          private: ''
        }
      }
    },
    methods: {
      clearData () {
        this.searchText = {
          public: '',
          private: ''
        }
        this.scope = 'public'
        this.imageList = {
          public: [],
          private: []
        }
      },
      loadData (scope) {
        const params = {
          n: this.queryNum,
          scope: scope,
        }
        if (this.imageList[scope].length > 0) {
          params.last = _.last(this.imageList[scope])
        }
        if (this.searchText[scope]) {
          // params.search = this.searchText[scope]
          return this.$api.image.searchImage(this.searchText[scope])
            .then(res => {
              return [res.data.name]
            })
        }
        return this.$api.image.listImage(params)
          .then(res => {
            return res.data.repositories
          })
      },
      infiniteFactory (scope) {
        return $state => {
          this.loadData(scope)
          .then(images => {
            this.imageList[scope] = this.imageList[scope].concat(images)
            if (images.length < this.queryNum ) {
              $state.loaded();
              $state.complete();
            } else {
              $state.loaded();
            }
          }).catch(err => {
            this.imageList[scope] = []
            $state.complete()
          })
        }
      },
      getImageName (item) {
        return item.split('/')[1]
      },
      onItemClick (item) {
        this.$emit('submit', this.prefix + item)
        this.visible = false
      },
      onSearch () {
        this.searchText[this.scope] = this.inputText
        this.imageList[this.scope] = []
        this.resetList(this.scope)
      },
      resetList (scope) {
        this.$refs[scope + 'Infinit'].$emit('$InfiniteLoading:reset')
      }
    },
    watch: {
      value (newVal) {
        if (newVal !== this.visible) {
          this.visible = newVal
          this.clearData()
        }
        if (newVal) {
          this.$nextTick(() => {
            this.resetList('public')
          })
        }
      },
      visible (newVal) {
        this.$emit('input', newVal)
      },
      scope (newVal) {
        if (this.imageList[newVal].length === 0) {
          this.resetList(newVal)
        }
        // 修改inputText
        this.inputText = this.searchText[newVal]
      }
    }
  }
</script>

<style lang="less" scoped>
  @import '../../../style/variable';
  @item-height: 30px;

  .dialog-body {
    position: relative;
  }
  .dialog-search-input {
    width: 200px;
    position: absolute;
    top: -2px;
    right: 0;
  }
  .image-list {
    height: 500px;
    overflow-y: auto;
  }
  .image-item {
    /*overflow-y: scroll;*/
    clear: both;
    border: 1px solid @border-color-split;
    margin-bottom: 2px;
    padding: 5px;

    & > i {
      height: @item-height;
      float: left;
    }
    & > span {
      line-height: @item-height;
      display: inline-block;
      margin-left: 5px;
    }

    &:hover {
      border-color: @info-color;
    }
  }
  .image-pic {
    display: inline-block;
    width: 60px;
    background-size: contain;
    background: url(../../../assets/images/registry.png) no-repeat;
  }
</style>

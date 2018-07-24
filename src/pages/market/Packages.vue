<template>
  <div style="padding: 20px 40px;">
    <div class="filter-header">
      <Select v-model="selectedRepository" style="width: 120px;">
        <Option value="All">所有仓库</Option>
        <Option v-for="opt in repositoryList" :key="opt" :value="opt">{{opt}}</Option>
      </Select>
      <span style="margin-left: 10px;">排序：</span>
      <Select v-model="orderBy" style="width: 120px;">
        <Option v-for="opt in orderList" :key="opt" :value="opt">{{opt}}</Option>
      </Select>
      <i-input icon="search" :value="searchText" v-model-debounce="searchText"
               style="width: 200px; margin-left: 10px;"></i-input>
      <Button type="info" @click="goBack" icon="ios-undo" style="float: right;"></Button>
    </div>
    <div class="image-container">
      <PackageCard v-for="image in showPackageList" :key="image.name"
                 :info="image"
                 @click="onPackageClick(image)">
      </PackageCard>
    </div>
  </div>

</template>

<script>
  // https://apigw.example.com:8143/helm/stable/index.yaml
  // https://apigw.example.com:8143/helm/stable/index.yaml
  // https://apigw.example.com:8143/helm/assets/mysql-0.8.2.png
  import PackageCard from './PackageCard'

  import _ from 'lodash'

  export default {
    name: 'images',
    components: { PackageCard },
    data () {
      return {
        repositoryList: ['stable', 'incubator'],
        selectedRepository: 'All',
        orderBy: '名称',
        orderList: ['名称', '创建时间'],
        imageList: [],
        searchText: ''
      }
    },
    computed: {
      showPackageList () {
        const orderBy = {
          '名称': 'name',
          '创建时间': 'created'
        }[this.orderBy]
        return _(this.imageList)
          .filter(image => {
            if (this.selectedRepository === 'All') return true
            return image.repository === this.selectedRepository
          })
          .filter(image => {
            if (!this.searchText) return true
            return _.includes(image.name, this.searchText)
          })
          .orderBy(orderBy)
          .value()
      }
    },
    methods: {
      loadData () {
        Promise.all([
          this.$api.image.getPackageList('stable'),
          this.$api.image.getPackageList('incubator'),
        ])
          .then(resList => {
            this.imageList = this.getPackagesFormEntries(resList[0].entries, 'stable')
              .concat(this.getPackagesFormEntries(resList[1].entries, 'incubator'))
          })
      },
      getPackagesFormEntries (entries, repo) {
        return _.map(entries, items => items[0])
          .filter(item => item)
          .map(item => {
            item.repository = repo
            return item
          })
      },
      onPackageClick (image) {
        this.$router.push({
          name: 'market-package-info',
          params: {
            repository: image.repository,
            name: image.name,
            version: image.version
          }
        })
      },
      goBack () {
        this.$router.push({name: 'market-release-list'})
      }
    },
    created () {
      this.loadData()
    }
  }
</script>

<style lang="less" scoped>
  @import '../../style/variable';
  @border-color: darken(@border-color-split, 5%);

  .filter-header {
    padding-bottom: 10px;
    border-bottom: 1px solid @border-color;

  }

  ul.image-menu {
    li {
      cursor: pointer;
      font-size: 16px;
      margin: 10px;
      color: @sub-text-color;
      list-style-type:none;
    }
    li.item-active {
      color: @text-color;
    }
  }
  .image-container {
    margin-top: 25px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

</style>

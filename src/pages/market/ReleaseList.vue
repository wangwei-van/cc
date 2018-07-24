<template>
  <div style="padding-left: 20px;">
    <div style="padding-right: 20px;">
      <div class="release-header">
        <Select v-model="selectedStatus" style="width: 120px;">
          <Option value="All">所有状态</Option>
          <Option v-for="item in statusList" :key="item" :value="item">{{item}}</Option>
        </Select>
        <span style="margin-left: 10px;">排序：</span>
        <Select v-model="orderBy" style="width: 120px;">
          <Option value="name">名称</Option>
          <Option value="date">日期</Option>
        </Select>

        <Button type="info" @click="handleClickInstall" style="float: right;">启动</Button>
      </div>
    </div>

    <div class="release-list">
      <div v-for="release in showReleaseList"
           :key="release.name"
           class="release-card">
        <div class="icon-box">
          <img :src="`/helm/assets/${release.chart}-${release.version}.png`" alt="">
        </div>

        <div class="info-box">
          <div style="padding-top: 20px; line-height: 20px;">
            <a style="float: left; font-size: 14px;" @click="handleClickRelease(release)">{{release.name}}</a>
            <div style="float: right;">
              <span>{{release.status}}</span>
            </div>
          </div>
          <div style="padding-top: 10px; line-height: 20px; clear: both;">
            <span>Chart: {{release.chart}}</span>
            <span style="float: right">{{release.date | timeFormat}}</span>
          </div>
        </div>

      </div>
    </div>
  </div>

</template>

<script>
  import dayjs from 'dayjs'
  import _ from 'lodash'

  export default {
    name: 'ReleaseList',
    props: {
      cluster: String,
      namespace: String
    },
    data () {
      return {
        releaseList: [],
        selectedStatus: 'All',
        orderBy: 'name'
      }
    },
    computed: {
      showReleaseList () {
        return _(this.releaseList)
          .filter(release => {
            return this.selectedStatus === 'All' || release.status === this.selectedStatus
          })
          .orderBy(this.orderBy)
          .value()
      },
      statusList () {
        return _(this.releaseList).map('status').uniq().value()
      }
    },
    methods: {
      loadData () {
        this.releaseList =  [
          {
            "name": "argo-artifacts",
            "chart": "minio-1.2.0",
            "namespace": "cgj",
            "date": "Thu Jun 21 07:23:42 2018",
            "status": "DEPLOYED"
          },
          {
            "name": "cgj-no-ck",
            "chart": "jenkins-0.16.3",
            "namespace": "cgj",
            "date": "Wed Jun 27 14:45:02 2018",
            "status": "DEPLOYED"
          },
          {
            "name": "cgj-no-ck2",
            "chart": "jenkins-0.16.3",
            "namespace": "cgj",
            "date": "Wed Jun 27 14:45:02 2017",
            "status": "DEPLOYED"
          }
        ]
      },
      handleClickRelease (release) {
        this.$router.push({name: 'release-info', params: {}})
      },
      handleClickInstall () {
        this.$router.push({name: 'market-package'})
      }
    },
    created () {
      this.loadData()
    },
    filters: {
      timeFormat (val) {
        return dayjs(val).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    watch: {
      $route () {
        this.selectedStatus = 'All'
        this.loadData()
      }
    }
  }
</script>

<style lang="less" scoped>
  @import '../../style/variable';
  @border-color: darken(@border-color-split, 5%);

  .release-header {
    padding-bottom: 10px;
    border-bottom: 1px solid @border-color;
    margin-bottom: 20px;
  }

  .release-list {
    display: flex;
    flex-wrap: wrap;
  }

  .release-card {
    display: flex;
    height: 120px;
    border: 1px solid @border-color;
    width: calc(50% - 20px);
    margin-right: 20px;
    margin-bottom: 20px;
    position: relative;
    background: white;
    .icon-box {
      display: flex;
      align-content: center;
      justify-content: center;
      width: 120px;
      height: 100%;
      border-right: 1px solid @border-color;
      img {
        max-width: 80%;
        max-height: 80%;
        align-self: center;
      }
    }

    .info-box {
      height: 100%;
      flex-grow: 1;
      padding: 0 20px;

      & > div {
        height: 50%;
      }
      & > div:first-child {
        border-bottom: 2px solid @border-color;
      }
    }
  }



</style>

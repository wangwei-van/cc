<template>
  <Layout style="padding: 0 25px 20px 30px;" v-back-to.parent>
    <portal to="namespace">
      <Button v-if="showTopButton" type="info" icon="archive"
              size="small" @click="onClickInstall">安装</Button>
    </portal>
    <Header class="info-header">
      <Breadcrumb class="custom-breadcrumb">
        <BreadcrumbItem>市场</BreadcrumbItem>
        <BreadcrumbItem :to="{name: 'market-package'}">软件仓库</BreadcrumbItem>
        <BreadcrumbItem>{{name}}</BreadcrumbItem>
      </Breadcrumb>

      <div style="display: flex;">
        <div class="icon-box">
          <img :src="iconPath" alt="" >
        </div>
        <div class="title-info">
          <h1>{{name}}</h1>
          <p>
            {{version}} - {{repository}}
            <Button type="info" icon="archive" size="small"
                    @click="onClickInstall"
                    style="margin-left: 10px; padding-left: 10px; padding-right: 10px;">安装</Button>
          </p>
          <p>{{chartData.description}}</p>
        </div>

      </div>
    </Header>
    <Content>
      <Layout>
        <Content style="padding-right: 10px;">
          <div class="package-readme" style="background: white; padding: 10px;"></div>
        </Content>
        <Sider style="background: transparent;" :width="350">
          <div class="sider-card">
            <div class="chart-item">
              <h1>Chart Versions</h1>
              <p v-for="chart in chartList">
                <a :class="{'current-version': chart.version === version}"
                   @click="onVersionClick(chart.version)">
                  {{chart.version}}
                </a>
                <span>-</span>
                <span>{{chart.created | showDate}}</span>
              </p>

            </div>

            <div v-for="item in showChartData" :key="item.name" class="chart-item">

              <h1>{{item.name}}</h1>
              <a v-if="item.name === 'home'" :href="item.content">{{item.content}}</a>

              <template v-else-if="item.name === 'sources'">
                <a v-for="s in item.content" :key="s" :href="s" class="chart-link" target="_blank">{{s}}</a>
              </template>

              <template v-else-if="item.name === 'maintainers'">
                <a v-for="m in item.content" :key="m.name" :href="`mailto:${m.mail}`" class="chart-link">{{m.name}}</a>
              </template>

              <template v-else-if="item.name ==='keywords'" >
                <Tag v-for="kw in item.content" :key="kw">{{kw}}</Tag>
              </template>
              <span v-else>{{item.content}}</span>

            </div>
          </div>
        </Sider>
      </Layout>
    </Content>
    <InstallPackageDialog v-model="installDialogVisible"
                          :value-text="valueText"
                          :loading="submitLoading"
                          @submit="handleInstall">
    </InstallPackageDialog>

  </Layout>

</template>

<script>
  import _ from 'lodash'
  const JSZip = require("jszip")
  const marked = require('marked')
  const YAML2JSON = require("js-yaml");
  import dayjs from 'dayjs'
  import InstallPackageDialog from './InstallPackageDialog'

  export default {
    name: 'package-info',
    components: { InstallPackageDialog },
    props: {
      repository: String,
      name: String,
      version: String
    },
    data () {
      return {
        zip: null,
        chartData: {},
        chartList: [],
        installDialogVisible: false,
        valueText: '',
        submitLoading: false,
        showTopButton: false
      }
    },
    computed: {
      showChartData () {
        return _(this.chartData).map((val, key) => ({
          name: key,
          content: val
        }))
          .filter(item => !_.includes(['icon', 'name', 'description', 'version'], item.name))
          .value()
      },
      iconPath () {
        return `/helm/assets/${this.name}-${this.version}.png`
      }
    },
    methods: {
      loadData () {
        this.$Loading.start();
        this.$api.image.getPackageInfo(this.repository, this.name, this.version)
          .then(res => {
            return JSZip.loadAsync(res.data)
          })
          .then(zip => {
            this.zip = zip
            this.initReadme()
            this.initChart()
            this.$Loading.finish();
          })
          .catch(err => {
            this.$Message.error('获取软件信息失败，请稍后刷新重试!')
            this.$Loading.finish();
          })
        this.getChartVersions()
      },
      initReadme () {
        const readmePath = this.getZipPath('README.md')
        if (!readmePath) return
        this.zip.file(readmePath).async('string')
          .then(mdText => {
            document.getElementsByClassName('package-readme')[0].innerHTML = marked(mdText)
          })
      },
      initChart () {
        const chartPath = this.getZipPath('Chart.yaml')
        if (!chartPath) return
        this.zip.file(chartPath).async('string')
          .then(yamlText => {
            return YAML2JSON.safeLoad(yamlText)
          })
          .then(chartData => {
            this.chartData = chartData
          })
      },
      getZipPath (name) {
        const reg = new RegExp(`^[^\/]+\/${name}$`, 'i')
        return _(this.zip.files).map((data, key) => key)
          .filter(path => path.match(reg))
          .first()
      },
      getChartVersions () {
        this.$api.image.getPackageList(this.repository)
          .then(data => {
            this.chartList = _.orderBy(data.entries[this.name], ['created', 'desc'])
          })
          .catch(err => {
            console.log(err)
          })
      },
      onVersionClick (version) {
        if (version === this.version) return
        this.$router.push({
          name: this.$route.name,
          params: {
            ...this.$route.params,
            version: version
          }
        })
      },
      onClickInstall () {
        if (this.hasOpened) {
          this.installDialogVisible = true
          return
        }
        const valuePath = this.getZipPath('values.yaml')
        this.zip.file(valuePath).async('string')
          .then(yamlText => {
            this.hasOpened = true
            this.installDialogVisible = true
            this.valueText = yamlText
          })
      },
      handleInstall ({releaseName, cluster, namespace, yaml}) {
        this.submitLoading = true
        const text = `ReleaseName:  ${releaseName}\n` +
          `ChartName: ${this.name}\n` +
          `ChartVersion: ${this.version}\n`
          + yaml
        this.$api.image.createRelease(cluster, namespace, text)
          .then(res => {
            this.$Message.success('安装成功')
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '安装失败')
          })
      }
    },
    mounted () {
      this.loadData()
      // 绑定滚动事件
      this.$el.parentNode.addEventListener('scroll', (evt) => {
        this.showTopButton = evt.target.scrollTop > 150
      })
    },
    filters: {
      showDate: function (value) {
        return dayjs(value).format('YYYY-MM-DD')
      }
    }

  }
</script>

<style lang="less" scoped>
  @import '../../style/variable';
  .sider-card {
    border: 1px solid @border-color-split;
    box-shadow: 1px 1px 10px rgba(0,0,0,.07);
    padding: 25px;
    /*margin-top: 30px;*/
    font-size: 1.2em;
    background: white;
    h1 {
      margin-bottom: 10px;
      font-weight: 400;
    }
    .chart-item {
      margin-bottom: 25px;
      word-break: break-word;
    }
    .chart-link {
      display: block;
    }
  }
  .icon-box {
    border: 2px solid @sub-text-color;
    border-radius: 6px;
    height: 100px;
    width: 100px;
    display: flex;
    align-content: center;
    justify-content: center;
    background: white;
    flex-shrink: 0;
    img {
      max-width: 80%;
      max-height: 80%;
      align-self: center;
    }
  }
  .header-info {
    display: inline-block;
  }

  .info-header {
    background: transparent;
    height: 200px;
    padding: 0;
  }

  .title-info {
    margin-left: 20px;
    h1 {
      line-height: 38px;
      font-size: 2.2em;
      color: @title-color;
      /*margin-top: 10px;*/
    }
    p {
      height: 28px;
      line-height: 28px;
      font-size: 14px;
    }
  }
  .current-version {
    font-weight: 700;
  }


</style>

<style lang="stylus">

  .package-readme
    $color-primary = #42b983
    $color-bg = #fff
    $color-text = #34495e
    $sidebar-width = 300px

    /*@import 'basic/_layout'*/
    /*@import 'basic/_coverpage'*/

    font-size 1.2em

    .app-sub-sidebar
      li
        &::before
          content '-'
          padding-right 4px
          float left

    /* markdown content found on pages */
    h1, h2, h3, h4, strong
      color #2c3e50
      font-weight 600

    a
      color var(--theme-color, $color-primary)
      font-weight 600

    h1
      font-size 2rem
      margin 0 0 1rem

    h2
      font-size 1.75rem
      margin 45px 0 0.8rem

    h3
      font-size 1.5rem
      margin 40px 0 0.6rem

    h4
      font-size 1.25rem

    h5
      font-size 1rem

    h6
      color #777
      font-size 1rem

    figure, p
      margin 1.2em 0

    p, ul, ol
      line-height 1.6rem
      word-spacing 0.05rem

    ul, ol
      padding-left 1.5rem

    blockquote
      border-left 4px solid var(--theme-color, $color-primary)
      color #858585
      margin 2em 0
      padding-left 20px

    blockquote p
      font-weight 600
      margin-left 0

    iframe
      margin 1em 0

    em
      color #7f8c8d

    code
      background-color #f8f8f8
      border-radius 2px
      color #e96900
      font-family 'Roboto Mono', Monaco, courier, monospace
      font-size 0.8rem
      margin 0 2px
      padding 3px 5px
      white-space pre-wrap

    pre
      -moz-osx-font-smoothing initial
      -webkit-font-smoothing initial
      background-color #f8f8f8
      font-family 'Roboto Mono', Monaco, courier, monospace
      line-height 1.5rem
      margin 1.2em 0
      overflow auto
      padding 0 1.4rem
      position relative
      word-wrap normal

    /* code highlight */
    .token.comment, .token.prolog, .token.doctype, .token.cdata
      color #8e908c

    .token.namespace
      opacity 0.7

    .token.boolean, .token.number
      color #c76b29

    .token.punctuation
      color #525252

    .token.property
      color #c08b30

    .token.tag
      color #2973b7

    .token.string
      color var(--theme-color, $color-primary)

    .token.selector
      color #6679cc

    .token.attr-name
      color #2973b7

    .token.entity, .token.url, .language-css .token.string, .style .token.string
      color #22a2c9

    .token.attr-value, .token.control, .token.directive, .token.unit
      color var(--theme-color, $color-primary)

    .token.keyword
      color #e96900

    .token.statement, .token.regex, .token.atrule
      color #22a2c9

    .token.placeholder, .token.variable
      color #3d8fd1

    .token.deleted
      text-decoration line-through

    .token.inserted
      border-bottom 1px dotted #202746
      text-decoration none

    .token.italic
      font-style italic

    .token.important, .token.bold
      font-weight bold

    .token.important
      color #c94922

    .token.entity
      cursor help

    pre > code
      -moz-osx-font-smoothing initial
      -webkit-font-smoothing initial
      background-color #f8f8f8
      border-radius 2px
      color #525252
      display block
      font-family 'Roboto Mono', Monaco, courier, monospace
      font-size 0.8rem
      line-height inherit
      margin 0 2px
      max-width inherit
      overflow inherit
      padding 2.2em 5px
      white-space inherit

    code::after, code::before
      letter-spacing 0.05rem

    code .token
      -moz-osx-font-smoothing initial
      -webkit-font-smoothing initial
      min-height 1.5rem

    pre::after
      color #ccc
      content attr(data-lang)
      font-size 0.6rem
      font-weight 600
      height 15px
      line-height 15px
      padding 5px 10px 0
      position absolute
      right 0
      text-align right
      top 0

    table
      border-collapse collapse
      border-spacing 0
      display block
      margin-bottom 1rem
      overflow auto
      width 100%

    th
      border 1px solid #ddd
      font-weight bold
      padding 6px 13px

    td
      border 1px solid #ddd
      padding 6px 13px

    tr
      border-top 1px solid #ccc

      &:nth-child(2n)
        background-color #f8f8f8
</style>

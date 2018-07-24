<template>
  <div class="data-table-server">
    <div class="table-wraper">
      <i-table stripe ref="table"
        class="data-table-server"
        v-bind="$props"
        :columns="tableCols"
        :data="tableData"
        @on-current-change="emitCurrentChange"
        @on-select="emitSelect"
        @on-select-cancel="emitSelectCancel"
        @on-select-all="emitSelectAll"
        @on-selection-change="setSelectedData"
        @on-sort-change="emitSortChange"
        @on-filter-change="emitFilterChange"
        @on-row-click="emitRowClick"
        @on-row-dblclick="emitRowDblclick"
        @on-expand="emitExpand"
        >
      </i-table>
    </div>
    <!-- 分页组件 -->
    <div class="table-page clearfix"
      v-if="pageConfig"
      :style="{'textAlign': 'right'}">
      <Page ref="page" style="float: none; display: inline-block"
        :size="pageConfig.size || 'small'"
        :total="total"
        :page-size="pageSize"
        :show-elevator="pageConfig.showElevator || false"
        :show-sizer="pageConfig.showSizer || false"
        show-total
        placement="top"
        @on-change="pageChange"
        @on-page-size-change="pageSizeChange"></Page>
    </div>
    <!-- 加载中 -->
    <Spin size="large" fix v-show="spin" class="login_loading_spin">
      <Icon type="load-c" size="18" class="login-spin-icon-load"></Icon>
      <div>加载中...</div>
    </Spin>
  </div>
</template>

<script>
  /**
   * @prop 包含所有iview table 属性
   * @prop pageConfig 分页配置 { showSizer: 单页数量, showElevator: , initPage: , initLoad}
   * @prop fetchApi 获取表格数据函数
   * @prop fetchFilters 过滤表格数据的
   * @prop initLoad 是否创建后初始化加载数据
   */
  import _ from 'lodash'
  import {Table as iTable, Page, Spin} from 'iview'

  let iTableProps = _.cloneDeep(iTable.props)
  delete iTableProps.data

  export default {
    name: 'DataTableServer',
    model: {
      prop: 'data',
      event: 'on-data-change'
    },
    components: {iTable, Page, Spin},
    props: {
      ...iTableProps,
      data: {
        type: Array,
        default () {
          return []
        }
      },
      /* 分页配置|选填 */
      pageConfig: {
        type: Object,
        // required: false,
        default: () => ({
          showSizer: true,
          showElevator: false,
          initPage: 1
        })
      },
      /* http请求配置|必填 */
      fetchApi: {
        type: Function,
        required: true
      },
      // 过滤器列表
      fetchFilters: {
        type: Array,
        default: () => []
      },
      initLoad: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        tableData: this.data || [],
        selectedData: [],
        spin: false,
        /* 分页相关 */
        pageSize: this.pageConfig.pageSize || 10,
        page: this.pageConfig.initPage || 1,
        total: 0,
        order: '',
        throttleNum: 0
      }
    },
    computed: {
      tableCols () {
        return this.columns.map(col => {
          let newCol = {...col}
          // 设置列排序时，从后台获取
          if (col.sortable) {
            col.sortable = 'custom'
          }
          return newCol
        })
      }
    },
    mounted () {
      // 如果设置初始化加载数据
      if (this.initLoad) {
        this.refresh()
      }
    },
    watch: {
      selectedData (v) {
        this.emitSelectionChange(v)
      },
      // 当过滤器修改时，更新数据
      fetchFilters (newVal) {
        this.refresh()
      }
    },
    methods: {
      /* ----- 更新表格数据 ----- */
      refresh () {
        // 防止同一时间触发多次更新
        this.throttleNum ++
        const thisNum = this.throttleNum
        setTimeout(() => {
          if (thisNum !== this.throttleNum) return
          this.spin = true
          this.load()
            .then(tableData => {
              this.resetSelectedData()
              this.tableData = tableData
              this.total = parseInt(res.total)
              if (res.page) this.page = res.page
              this.$emit('on-data-change', res) // 触发父组件data变化
            })
            .catch(err => {
              console.log(err)
              this.$Message.error(`请求错误；错误信息：${err}`)
            })
            .then(() => {
              this.spin = false
            })
        }, 0)
      },
      load (/* config, cb */) {
        // 生成分页请求表单
        let formData = {
          page: this.page,
          pageSize: this.pageSize
        }
        if (this.order) {
          formData.order = this.order
        }
        return this.fetchApi(formData)
      },
      /* ----- 分页相关 ----- */
      /* 调用加载第n页方法 */
      pageChange (page) {
        this.page = page
        this.refresh()
      },
      /* 改变页面容量，重新加载 */
      pageSizeChange (size) {
        this.pageSize = size
        this.refresh()
      },

      /**
       * 转发table监听的event：
       */
      resetSelectedData () {
        this.selectedData = []
      },
      setSelectedData (data) {
        this.selectedData = data
      },
      /* emit事件 */
      emitCurrentChange (currentRow, oldCurrentRow) {
        this.$emit('on-current-change', currentRow, oldCurrentRow)
      },
      emitSelect (selection, row) {
        this.$emit('on-select', selection, row)
      },
      emitSelectCancel (selection, row) {
        this.$emit('on-select-cancel', selection, row)
      },
      emitSelectAll (selection) {
        this.$emit('on-select-all', selection)
      },
      emitSelectionChange (selection) {
        this.$emit('on-selection-change', selection)
      },
      emitSortChange ({column, key, order}) {
        this.order = order === 'normal' ? '' : key + '|' + order
        this.refresh()
        this.$emit('on-sort-change', {column, key, order})
      },
      emitFilterChange (currentCol) {
        this.$emit('on-filter-change', currentCol)
      },
      emitRowClick (currentRow, index) {
        this.$emit('on-row-click', currentRow, index)
      },
      emitRowDblclick (currentRow, index) {
        this.$emit('on-row-dblclick', currentRow, index)
      },
      emitExpand (row, status) {
        this.$emit('on-expand', row, status)
      },
      // 重置页数
      resetPage () {
        this.page = 1
        this.$refs['page'].currentPage = 1
      }
    }
  }
</script>

<style lang="less" scoped>
  .data-table-server {
    position: relative;
  }

  .table-page {
    margin-top: 10px;
  }

</style>

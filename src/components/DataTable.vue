<template>
  <div class="table-data">
    <Table v-bind="$props"
           :columns="thisColumns"
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
    </Table>
    <div style="text-align: right; position: relative;">
      <Page :total="total"
            :page-size="pageSize"
            :current.sync="page"
            :page-size-opts="initPage.pageSizeOpts || [10, 20, 30, 40]"
            class="data-table-page"
            size="small"
            placement="top"
            show-sizer
            :style="{marginTop: '10px'}"
            @on-page-size-change="onPageSizeChange"
            @on-change="onPageChange"
            show-total>
      </Page>
    </div>
  </div>
</template>

<script>
  /**
   * @prop: searchText 模糊搜索字符串,
   * @prop: column: {
   *   ... iview table props,
   *   searchable: false/true,  列是否可被全局搜索
   *   filters: [{label: '显示值', value: '过滤使用值'}]   // 与cell的value完全匹配
   *   filteredValue: ['value1', 'value2']
   * },
   * @prop: 其他prop和事件参考iview Table组件
   *
   * data => filter => search => sort => page => tableData
   *
   */

  // todo emit event
  import _ from 'lodash'
  import {Table as iTable} from 'iview'
  let iTableProps = _.cloneDeep(iTable.props)

  function createElement (tag, props, text) {
    if (_.isArray(text)) {
      return text.join('')
    } else {
      return _.toString(text)
    }
  }

  function getDomText (rowData, cols) {
    let rowDomText = {}
    cols.forEach(col => {
      // 不可搜索则跳过
      if (!col.searchable) return
      if (col.render) {
        let text = col.render(createElement, {row: rowData})
        rowDomText[col.key] = _.isArray(text) ? text.join('') : text
      } else {
        rowDomText[col.key] = _.toString(rowData[col.key])
      }
    })
    return rowDomText
  }

  export default {
    name: 'data-table',
    props: {
      ...iTableProps,
      searchColumn: {
        type: String,
        default: null
      },
      searchText: {
        type: String,
        default: ''
      },
      initPage: {
        type: Object,
        default: () => ({
          page: 1,
          pageSize: 10,
          pageSizeOpts: [10, 20, 30, 40]
        })
      },
      pageable: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        sourceData: this.getSourceData(),
        thisColumns: this.getCols(),
        page: this.initPage.page,
        orderKey: '',
        orderType: '',
        filterItems: this.getInitFilterItems(),
        pageSize: this.initPage.pageSize,
      }
    },
    computed: {
      filteredData () {
        if (_.isEmpty(this.filterItems)) {
          return this.sourceData
        }

        return this.sourceData.filter(rowData => {
          return _(this.filterItems)
            .map((values, key) => values.indexOf(rowData[key]) > -1)
            .every()
        })
      },
      searchData () {
        if (this.searchText) {
          return this.filteredData.filter(rowData => {
            if (this.searchColumn) {
              let text = rowData._domText[this.searchColumn]
              if (text && text.indexOf(this.searchText) !== -1) return true
            } else {
              for (let i = 0; i < this.columns.length; i++) {
                if (!this.columns[i].searchable) continue
                let text = rowData._domText[this.columns[i].key]
                if (text.indexOf(this.searchText) !== -1) return true
              }
            }
            return false
          })
        } else {
          return this.filteredData
        }
      },
      orderedData () {
        let orderedData = null
        if (this.orderKey) {
          orderedData = _.orderBy(this.searchData, this.orderKey, this.orderType)
        } else {
          orderedData = this.searchData
        }
        orderedData.forEach((rowData, i) => {rowData.t_no = i + 1})
        return orderedData
      },
      tableData () {
        if (this.pageable) {
          return this.orderedData.slice(this.pageSize * (this.page - 1), this.pageSize * this.page)
        } else {
          return this.orderedData
        }
      },
      total () {
        return this.searchData.length
      }
    },
    methods: {
      getCols () {
        return this.columns.map(col => {
          const newCol = {...col}
          if (col.sortable) {
            newCol.sortable = 'custom'
          }
          if (col.filters) {
            newCol.filterMethod = () => true
          }
          return newCol
        })
      },
      getInitFilterItems () {
        const output = {}
        _.map(this.columns, col => {
          if (col.filteredValue) {
            output[col.key] = col.filteredValue
          }
        })
        return output
      },
      getSourceData () {
        return this.data.map(rowData => {
          rowData._domText = getDomText(rowData, this.columns)
          return rowData
        })
      },
      /* 转发事件 */
      resetSelectedData () {
        this.selectedData = []
      },
      setSelectedData (data) {
        this.selectedData = data
        this.emitSelectionChange(data)
      },
      onPageChange (page) {
        this.selectedData = []
        this.emitSelectionChange(this.selectedData)
      },
      onPageSizeChange (pageSize) {
        this.pageSize = pageSize
        this.selectedData = []
        this.emitSelectionChange(this.selectedData)
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
        this.orderKey = key
        this.orderType = order
        this.$emit('on-sort-change', {column, key, order})
      },
      emitFilterChange (currentCol) {
        if (_.isEmpty(currentCol._filterChecked)) {
          this.$delete(this.filterItems, currentCol.key)
        } else {
          this.filterItems = {
            ...this.filterItems,
            [currentCol.key]: currentCol._filterChecked
          }
        }
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
      resetPage () {
        // 如果当前页大于最大页数，则跳转到最后一页
        if (this.page > 1 && (this.page - 1) * this.pageSize >= this.total) {
          this.page = Math.ceil(this.total / this.pageSize) || 1
        }
      }
    },
    watch: {
      data () {
        this.sourceData = this.getSourceData()
      },
      columns () {
        this.sourceData = this.getSourceData()
      },
      searchData () {
        this.resetPage()
      }
    }
  }
</script>

<style lang="less">
  @import '../style/variable';

  ul.data-table-page.ivu-page.mini {
    .ivu-page-prev, .ivu-page-item, .ivu-page-next {
      width: 28px;
      height: 28px;
      line-height: 28px;
      border-radius: 50%;
      background-color: #fff;
      box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.05);
      a, a > i::before {
        font-weight: 700;
      }
    }
    .ivu-page-item {
      margin-right: 8px;
      margin-left: 8px;
    }
    .ivu-page-item {
      a {
        color: @text-color;
      }
    }
    .ivu-page-item.ivu-page-item-active {
      a {
        color: @primary-color;
      }
    }
    .ivu-page-total {
      float: right;
      color: @sub-text-color;
      line-height: 30px;
    }
    .ivu-select-selection {
      height: 26px;
      line-height: 26px;
      border: 1px solid #fff;
      background-color: #fff;
      transition: all .2s;
      border-radius: 14px;
      box-shadow: 0 2px 6px rgba(0,0,0,.05);
      span.ivu-select-selected-value {
        line-height: 26px;
      }
    }
    .ivu-select-visible {
      .ivu-select-selection {
        border-color: @primary-color;
      }
    }
  }
</style>

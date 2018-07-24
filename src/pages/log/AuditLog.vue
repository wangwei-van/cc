<template>
  <div>
    <Breadcrumb class="custom-breadcrumb">
      <BreadcrumbItem>日志</BreadcrumbItem>
      <BreadcrumbItem>审计日志</BreadcrumbItem>
    </Breadcrumb>

    <div class="page-content-box">
      <div class="table-toolbar clearfix">
        <DatePicker v-model="datePeriod"
                    :options="dateOptions"
                    @on-ok="changeDate"
                    type="datetimerange"
                    placeholder="选择时间段"
                    placement="bottom-start"
                    style="margin-right: 5px; width: 280px"
                    transfer>
        </DatePicker>

        <i-input v-model="searchText"
                 placeholder="请输入精确值搜索"
                 icon="search"
                 @on-enter="onSearch"
                 style="width: 280px; float: right;">
          <Select slot="prepend" style="width: 80px" v-model="searchColumn">
            <Option v-for="column in searchColumns"
                    :value="column.key"
                    :key="column.key">
              {{column.title}}
            </Option>
          </Select>
        </i-input>
      </div>

      <DataTable :columns="cols"
                 :data="logs"
                 :loading="loading"
                 size="small">
      </DataTable>
    </div>
  </div>
</template>

<script>
  import dayjs from 'dayjs'
  import _ from 'lodash'

  export default {
    name: 'audit-log',
    props: {
      cluster: String,
      namespace: String
    },
    data () {
      return {
        logs: [],
        datePeriod: [new Date(new Date().getTime() - 1000 * 3600 * 24 * 3), new Date()],
        dateOptions: {
          shortcuts: [
            {
              text: '1 day',
              value () {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24);
                return [start, end];
              }
            },
            {
              text: '1 week',
              value () {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                return [start, end];
              }
            },
            {
              text: '1 month',
              value () {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                return [start, end];
              }
            },
            {
              text: '3 months',
              value () {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                return [start, end];
              }
            }
          ]
        },
        loading: true,
        searchColumn: 'username',
        searchText: '',
        cols: [
          {
            title: '操作用户',
            key: 'username',
            searchable: true,
            sortable: true
          },
          {
            title: '操作时间',
            key: 'timestamp',
            sortable: true
          },
          {
            title: '资源类型',
            key: 'sourcetype'
          },
          {
            title: '资源名称',
            key: 'sourcename'
          },
          {
            title: '动作',
            key: 'verb',
            searchable: true,
            sortable: true
          },
          {
            title: '请求',
            key: 'requestURI',
            searchable: true
          },
          {
            title: '操作源',
            key: 'sourceIp'
          },
        ]
      }
    },
    computed: {
      searchColumns () {
        // return this.cols.filter(item => {
        //   return item.key && !['timestamp', 'sourceIp'].includes(item.key)
        // })
        return [{title: '操作用户', key: 'username'}]
      }
    },
    methods: {
      // 保证直接编辑输入框能够取得正确的时间
      changeDate () {
        setTimeout(this.loadData, 1)
      },
      loadData (searchCondition = {}) {
        const params = {
          limit: 100,
          begin: dayjs(this.datePeriod[0]).toJSON(),
          end: dayjs(this.datePeriod[1]).toJSON(),
          namespace: this.namespace,
          ...searchCondition
        }
        this.loading = true
        this.$api.log.getAuditLogs(this.cluster, {params})
          .then(res => {
            this.loading = false
            this.logs = this.getTableData(res.data)
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '加载日志失败')
          })
      },
      onSearch () {
        let searchCondition = {} 
        searchCondition[this.searchColumn] = this.searchText
        this.loadData(searchCondition)
      },
      getTableData (data) {
        return data.hits.hits.map(item => {
          return {
            username: item._source.username || '',
            timestamp: dayjs(item._source['@timestamp']).format('YYYY-MM-DD HH:mm:ss'),
            sourceIp: item._source.sourceIPs ? item._source.sourceIPs.join(',') : '',
            requestURI: item._source.requestURI || 'NA',
            verb: item._source.verb || 'NA',
            sourcename: item._source.resourcename || 'NA',
            sourcetype: item._source.resourcetype || 'NA',
          }
        })
      }
    },
    mounted () {
      this.loadData()
    },
    watch: {
      $route () {
        let searchCondition = {} 
        searchCondition[this.searchColumn] = this.searchText
        this.loadData(searchCondition)
      } 
    }
  }
</script>

<style lang="less" scoped>

</style>

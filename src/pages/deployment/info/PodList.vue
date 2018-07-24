<template>
  <Table :columns="cols"
         :data="podList"
         :loading="loading"
         size="small"
         stripe>
  </Table>

</template>

<script>
  import {COLORS} from '@/pars'

  function getStatusColor (status) {
    switch (status) {
      case 'Running':
        return COLORS.success
      case 'Pending':
        return COLORS.warning
      default:
        return COLORS.error
    }
  }

  export default {
    name: 'instance-list',
    props: {
      info: Object,
      cluster: String,
      namespace: String,
      podList: {
        type: Array,
        default: () => []
      },
      loading: Boolean
    },
    data () {
      return {
        cols: [
          {key: 'name', title: '名称'},
          {
            key: 'status',
            title: '状态',
            render: (h, params) => {
              return [
                h('Icon',
                  {
                    props: {
                      type: 'android-radio-button-on',
                      color: getStatusColor(params.row.status)
                    },
                    style: {
                      marginRight: '5px'
                    }
                  }
                ),
                h('span', {}, params.row.status)
              ]
            }
          },
          {key: 'hostIP', title: '主机IP'},
          {key: 'cpuUsage', title: 'CPU使用率'},
          {key: 'memUsage', title: '内存使用率'},
          {key: 'createTime', title: '创建时间'},
          {
            key: 'name',
            title: '操作',
            render: (h, params) => {
              return [
                h(
                  'Icon',
                  {
                    props: {type: 'trash-a'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => {this.onClickDelete(params.row.name)}
                    }
                  }
                ),
                h(
                  'Icon',
                  {
                    props: {type: 'monitor'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => {this.onClickTerminal(params.row.name)}
                    }
                  }
                )
              ]
            }
          },
        ]
      }
    },
    methods: {
      onClickDelete (name) {
        this.$Modal.confirm({
          title: '删除实例',
          content: '<p>确认删除实例吗？</p>',
          loading: true,
          onOk: () => {
            this.$api.cluster(this.cluster).deletePod(this.namespace, name)
              .then(res => {
                this.$Modal.remove()
                this.$Message.success('删除成功')
              })
              .catch(err => {
                this.$NoticeAjaxError(err, '删除实例失败')
              })
          }
        })

      },
      onClickTerminal (name) {
        this.$emit('open-terminal', name)
      }
    }
  }
</script>

<style lang="less" scoped>

</style>

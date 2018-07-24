<template>
  <div>
    <Breadcrumb class="custom-breadcrumb">
        <BreadcrumbItem>应用</BreadcrumbItem>
        <BreadcrumbItem>存储</BreadcrumbItem>
    </Breadcrumb>

    <div class="page-content-box">
      <div class="table-toolbar">
        <Button type="success" icon="plus" @click="onClickCreate">创建动态卷</Button>

        <Button type="default"
                icon="trash-b"
                @click="() => deleteVolumes(selectedRows)"
                :disabled="selectedRows.length === 0"
                style="margin-left: 10px;">删除</Button>
        <Button type="info"
                icon="refresh"
                @click="loadData"
                style="float: right; margin-left: 10px;">
          刷新
        </Button>
        <i-input v-model="searchText"
                 placeholder="请输入搜索的应用名称"
                 icon="search"
                 style="width: 200px; float: right;">
        </i-input>
      </div>
      <DataTable :columns="cols"
                 :data="volumes"
                 :searchText="searchText"
                 :loading="loading"
                 size="small"
                 stripe
                 @on-selection-change="selections => selectedRows = selections">
      </DataTable>
    </div>
    <CreateVolumeDialog v-model="createDialogVisible" :cluster="cluster" @submit="handleCreate"></CreateVolumeDialog>
    <Modal title="编辑动态卷" v-model="modifyDialogVisible" @on-ok="handleModify">
      <Form :model="modifyForm" :rules="modifyRules" :label-width="60">
        <FormItem prop="name" label="名称：">
          <i-input v-model="modifyForm.name" disabled></i-input>
        </FormItem>
        <FormItem prop="comment" label="备注：">
          <i-input type="textarea" v-model="modifyForm.comment"></i-input>
        </FormItem>

      </Form>

    </Modal>
  </div>

</template>

<script>
  import _ from 'lodash'
  import dayjs from 'dayjs'
  import {COLORS} from '@/pars'
  import CreateVolumeDialog from './CreateVolumeDialog'

  const StatusList = ["Available", "Pending", "Used", "Lost", "Unknown"]

  export default {
    name: "VolumeList",
    props: {
      cluster: String,
      namespace: String
    },
    components: { CreateVolumeDialog },
    data () {
      // status col
      const queryStatus = this.$route.query.status
      const statusCol = {
        title: '状态',
        key: 't_status',
        width: 120,
        filters: StatusList.map(item => ({label: item, value: item})),
        render: (h, params) => {
          const iconColor = {
            Available: COLORS.success,
            UnAvailable: COLORS.warning,
            Used: COLORS.info,
            Lost: COLORS.error
          }[params.row.t_status]
          return [
            h('Icon', {props: {type: 'android-radio-button-on', color: iconColor}}),
            h('span', {style: {marginLeft: '5px'}}, params.row.t_status)
          ]
        }
      }
      if (queryStatus) {
        statusCol.filteredValue = [queryStatus]
      }
      return {
        cols: [
          {type: 'selection', width: 60, align: 'center'},
          {
            title: '存储名称',
            key: 't_name',
            searchable: true,
            sortable: true,
            render: (h, params) => {
              return h(
                'a',
                {on: {
                  click: () => {
                    const routeParams = {
                      ...this.$route.params,
                      volumeName: params.row.t_name
                    }
                    this.$router.push({name: 'deploy-volume-info', params: routeParams})
                  }
                }},
                params.row.t_name
              )
            }
          },
          statusCol,
          {title: '容量', key: 't_capacity', width: 120, sortable: true},
          {title: '存储池', key: 't_storageClass', width: 120, sortable: true},
          {title: '访问模式', width: 150, key: 't_accessMode'},

          {title: '创建时间', key: 't_createTime', width: 160, sortable: true},
          {
            title: '操作',
            key: 't_name',
            width: 100,
            render: (h, params) => {
              return [
                h(
                  'Icon',
                  {
                    props: {type: 'compose'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => this.onClickModifyVolume(params.row)
                    }
                  }
                ),
                h(
                  'Icon',
                  {
                    props: {type: 'trash-b'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => this.deleteVolumes([params.row])
                    }
                  })
              ]
            }
          }
        ],
        volumes: [],
        searchText: '',
        selectedRows: [],
        loading: false,
        createDialogVisible: false,
        modifyDialogVisible: false,
        modifyForm: {},
        modifyRules: {comment: [{max: 300, message: '长度不能超过300个字符'}]}
      }
    },
    methods: {
      loadData () {
         // 处理异常情况，如果namespace为null, 则设置为空
        if (this.namespace === 'null' || !this.namespace) {
          this.volumes = []
          return
        }
        this.loading = true
        this.$api.cluster(this.cluster).listVolumes(this.namespace)
          .then(res => {
            this.volumes = res.data.items.map(item => {
              _.extend(item, {
                t_name: _.get(item, 'metadata.name'),
                t_status: _.get(item, ['metadata', 'annotations', 'jdjr.com/status'], 'Unknown'),
                t_accessMode: _.get(item, 'spec.accessModes').join(', '),
                t_storageClass: _.get(item, 'spec.storageClassName'),
                t_capacity: _.get(item, 'spec.resources.requests.storage'),
                t_createTime: dayjs(_.get(item, 'metadata.creationTimestamp')).format('YYYY-MM-DD HH:mm:ss'),
              })
              return item
            })
            // this.loadStatus()
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取存储列表失败')
          })
          .then(() => {
            this.loading = false
          })
      },
      onClickCreate () {
        this.createDialogVisible = true
      },
      handleCreate (formData) {
        this.$api.cluster(this.cluster).createVolume(this.namespace, formData)
          .then(res => {
            this.$Message.success('创建成功')
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '创建失败')
          })
          .then(() => {
            this.loadData()
          })
      },
      deleteVolumes (rows) {
        let msg = '确定要删除动态卷吗？'
        if (rows.length === 1) {
          msg = `确定要删除卷: ${rows[0].metadata.name} 吗？`
        }
        this.$Modal.confirm({
          title: '删除动态卷',
          content: msg,
          loading: true,
          onOk: () => {
            this.$api.cluster(this.cluster).deleteVolumes(this.namespace, rows.map(row => row.metadata.name))
              .then(res => {
                this.$Message.success('删除动态卷成功')
              })
              .catch(err => {
                this.$NoticeAjaxError(err, '删除动态卷失败')
              })
              .then(() => {
                this.$Modal.remove()
                this.loadData()
              })
          }
        })
      },
      onClickModifyVolume (rowData) {
        this.modifyForm = {
          name: rowData.t_name,
          comment: rowData.t_comment
        }
        this.modifyDialogVisible = true
      },
      handleModify () {
        this.modifyDialogVisible = false
        const formData = {
          metadata: {
            annotations: {
              'comment.jd.com': this.modifyForm.comment
            }
          }
        }
        this.$api.cluster(this.cluster).patchVolumes(this.namespace, this.modifyForm.name, formData)
          .then(res => {
            this.$Message.success('修改成功')
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '修改失败')
          })
          .then(() => {
            this.loadData()
          })
      },
      loadStatus () {
        this.$api.cluster(this.cluster).listVolumesStatus()
          .then(res => {
            const volNameStatusMap = {}
            res.data.items.map(item => {
              volNameStatusMap[item.metadata.name] = item.status.phase
            })
            this.volumes = this.volumes.map(item => {
              const volName = _.get(item, 'spec.volumeName')
              item.t_status = volNameStatusMap[volName]
              return item
            })
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    watch: {
      $route () {
        this.loadData()
      }
    },
    created () {
      this.loadData()
    }
  }
</script>

<style lang="less" scoped>

</style>

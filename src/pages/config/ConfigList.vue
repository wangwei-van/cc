<template>
  <div>
    <Breadcrumb class="custom-breadcrumb">
      <BreadcrumbItem>应用</BreadcrumbItem>
      <BreadcrumbItem>配置管理</BreadcrumbItem>
    </Breadcrumb>

    <div class="page-content-box">
      <div class="table-toolbar clearfix">
        <Button type="success" icon="plus" @click="createConfig">创建配置</Button>

        <Button type="default"
                icon="trash-b"
                @click="() => deleteConfigs(selectedRows)"
                :disabled="selectedRows.length === 0"
                style="margin-left: 10px;">删除</Button>
        <Button type="info"
                icon="refresh"
                @click="loadData"
                style="float: right; margin-left: 10px;">
          刷新
        </Button>
        <i-input v-model="searchText"
                 placeholder="请输入关键字搜索"
                 icon="search"
                 style="width: 200px; float: right;">
        </i-input>
      </div>

      <DataTable :columns="cols"
                 :data="configs"
                 :searchText="searchText"
                 :loading="loading"
                 size="small"
                 @on-selection-change="selections => selectedRows = selections">
      </DataTable>
      <ConfigDialog v-model="dialogVisible"
                    :init-data="configInfo"
                    @submit="handleSubmit">
      </ConfigDialog>
      <Modal v-model="detailVisible" width="600"
             :title="showedConfig.t_name">
        <Tabs type="card" v-if="detailVisible">
         <TabPane v-for="(val, key) in showedConfig.data" :key="key" :label="key" :name="key">
           <i-input type="textarea" :value="val" :rows="20" readonly></i-input>
         </TabPane>
       </Tabs>
      </Modal>
    </div>
  </div>
</template>

<script>
  import ConfigDialog from './ConfigDialog'

  export default {
    name: 'config-list',
    components: {ConfigDialog},
    props: {
      cluster: String,
      namespace: String
    },
    data () {
      return {
        dialogVisible: false,
        configInfo: {},
        detailVisible: false,
        showedConfig: {},

        configs: [],
        loading: true,
        searchText: '',
        selectedRows: [],
        typeMap: {
          'secret': '秘钥集',
          'configmap': '配置集',
        },
        cols: [
          {type: 'selection', width: 60, align: 'center'},
          {
            title: '名称',
            key: 't_name',
            searchable: true,
            sortable: true,
            render: (h, params) => {
              return h('a', {
                on: {
                  click: () => {
                    this.showDetail(params.row)
                  }
                }
              } , params.row.t_name)
            }
          },
          {
            title: '类型',
            width: 300,
            key: 't_type',
            render: (h, params) => {
              return h('span', this.typeMap[params.row.t_type])
            }
          },
          {
            title: '操作',
            key: 't_operation',
            width: 120,
            render: (h, params) => {
              return [
                h(
                  'Icon',
                  {
                    props: {type: 'compose'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => this.modifyConfig(params.row)
                    }
                  }
                ),
                h(
                  'Icon',
                  {
                    props: {type: 'trash-b'},
                    class: {'table-tool-icon': true},
                    nativeOn: {
                      click: () => this.deleteConfigs([params.row])
                    }
                  })
              ]
            }
          }
        ]        
      }
    },
    methods: {
      loadData () {
        this.loading = true
        Promise.all([
          this.$api.cluster(this.cluster).listConfigs('configmap', this.namespace),
          this.$api.cluster(this.cluster).listConfigs('secret', this.namespace),
        ])
          .then(res => {
            this.loading = false
            const configmaps = res[0].data.items.map(item => {
              _.extend(item, {
                t_name: _.get(item, 'metadata.name'),
                t_type: 'configmap'
              })
              return item
            })
            const secrets = res[1].data.items.map(item => {
              _.extend(item, {
                t_name: _.get(item, 'metadata.name'),
                t_type: 'secret'
              })
              return item
            })
            this.configs = _.concat([], configmaps, secrets)
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '加载配置列表失败')
          })
      },
      handleSubmit (form) {
        if (form.type === 'create') {
          this.confirmCreate(form.formData) 
        } else {
          this.confirmModify(form.formData)
        }
      },
      confirmCreate (formData) {
        let data = {}
        _.forEach(formData.config_pars, item => {
          data[item.name] = item.value.val
        })
        const configData = {
          apiVersion: 'v1',
          kind: formData.type === 'configmap' ? 'ConfigMap' : 'Secret',
          metadata: {
            name: formData.name,
            namespace: this.namespace,
          },
          data
        }
        this.$api.cluster(this.cluster).createConfig(formData.type, this.namespace, configData)
          .then(res => {
            this.$Message.success('创建配置成功')
            this.loadData()
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '创建配置失败')
          })
          .then(() => {
            this.dialogVisible = false
          })
      },
      confirmModify (formData) {
        const name = formData.name

        let data = {}
        _.forEach(formData.config_pars, item => {
          data[item.name] = item.value.val
        })
        const patchData = {
          data
        }
        this.$api.cluster(this.cluster).patchConfig(formData.type, this.namespace, name, patchData)
          .then(res => {
            this.$Message.success('更新配置成功')
            this.loadData()
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '更新配置失败')
          })
          .then(() => {
            this.dialogVisible = false
          })
      },
      showDetail (config) {
        this.detailVisible = true
        this.showedConfig = config
      },
      deleteConfigs (rows) {
        let msg = '确定要删除配置文件吗？'
        if (rows.length === 1) {
          msg = `确定要删除配置文件: ${rows[0].metadata.name} 吗？`
        }
        this.$Modal.confirm({
          title: '删除配置文件',
          content: msg,
          loading: true,
          onOk: () => {
            this.$api.cluster(this.cluster).deleteConfigs(this.namespace, rows.map(row => ({name: row.metadata.name, type: row.t_type})))
              .then(res => {
                this.$Message.success('删除配置文件成功')
              })
              .catch(err => {
                this.$NoticeAjaxError(err, '删除配置文件失败')
              })
              .then(() => {
                this.$Modal.remove()
                this.loadData()
              })
          }
        })
      },
      createConfig () {
        this.configInfo = {}
        this.dialogVisible = true
      },
      modifyConfig (config) {
        let config_pars = []
        _.forEach(config.data, (val, key) => {
          config_pars.push({
            name: key,
            value: {
              val: val
            }
          })
        })
        this.configInfo = {
          name: config.metadata.name,
          type: config.t_type,
          config_pars
        }
        this.dialogVisible = true
      }
    },
    mounted () {
      this.loadData()
    },
    watch: {
      $route () {
        this.loadData()
      } 
    }
  }
</script>

<style lang="less" scoped>
  @import '../../style/variable';

  /deep/ textarea.ivu-input {
    box-shadow: none;
    &:hover, &:focus {
      border-color: @border-color-base;
      box-shadow: none;
    }
  }
</style>

<template>
  <Card>
    <p slot="title">
      {{name}}
    </p>
    <Row class="app-info">
      <i-col span="6">
        <p>
          <span>状态：</span>
          <Icon type="android-radio-button-on" :color="statusColor" v-if="info"></Icon>
          <span v-if="info">{{ status }}</span>
        </p>
        <p>
          <span>CPU：</span>
          <span>{{ cpuMemory.cpu }}</span>
        </p>
        <p>
          <span>内存：</span>
          <span>{{ cpuMemory.memory }}</span>
        </p>
      </i-col>
      <i-col span="6">
        <p>
          <span>应用类型：</span>
          <span>{{ kind }}</span>
        </p>
        <p>
          <span>所属用户：</span>
          <span>{{ user }}</span>
        </p>
        <p>
          <span>创建时间：</span>
          <span>{{ createTime }}</span>
        </p>
      </i-col>
      <i-col span="12">
        <p>
          <span>容器镜像：</span>
          <span>{{ image }}</span>
        </p>
        <p>
          <span>健康状态：</span>
          <Tag :color="color.success" class="custom-tag first">{{podHealthStatus.replicas}}</Tag>
            期望副本

          <Tag :color="color.warning" class="custom-tag">{{podHealthStatus.availableReplicas}}</Tag>
            就绪({{podHealthStatus.availablePercent}})

          <Tag :color="color.error" class="custom-tag">{{podHealthStatus.updatedReplicas}}</Tag>
            已更新({{podHealthStatus.updatedPercent}})
        </p>
        <p>
          <span>访问地址：</span>
          <span v-if="appAddress.internalAddr">
            <span v-if="appAddress.internalAddr.length === 0">--</span>
            <a v-else :href="appAddress.internalAddr[0]" target="_blank">{{appAddress.internalAddr[0]}}</a>
            <Tooltip placement="right" trigger="hover" v-if="appAddress.internalAddr.length + appAddress.externalAddr.length > 1">
              <Icon type="android-more-vertical" class="more-icon"></Icon>
              <div slot="content">
                <div>内部访问：</div>
                <div v-for="item in appAddress.internalAddr" :key="item" style="padding-left: 10px">
                  <a :href="'http://' + item" target="_blank">{{item}}</a>
                  <Tooltip content="复制" placement="right">
                    <Icon type="ios-copy-outline" v-clipboard="item" style="margin-left: 8px;cursor: pointer"></Icon>
                  </Tooltip>
                </div>
                <div v-if="appAddress.externalAddr.length > 0">外部访问：</div>
                <div v-for="(item, index) in appAddress.externalAddr" :key="index" style="padding-left: 10px">
                  <a :href="'http://' + item" target="_blank">{{item}}</a>
                  <Tooltip content="复制" placement="right">
                    <Icon type="ios-copy-outline" v-clipboard="item" style="margin-left: 8px;cursor: pointer"></Icon>
                  </Tooltip>
                </div>
              </div>
            </Tooltip>
          </span>
        </p>
      </i-col>
      <i-col span="12" class="clearfix">
        <span>描述：</span>
        <span class="app-desc">{{ desc }}</span>
      </i-col>
    </Row>
    <div>
      <Button type="ghost" icon="arrow-expand" @click="hpaVisible = true">水平扩展</Button>
      <Button type="ghost" icon="android-arrow-dropright-circle" @click="onClickRestart">重启</Button>
      <Button type="ghost" icon="arrow-graph-up-right" @click="rollingUpdateDialogVisible = true">滚动升级</Button>
      <Dropdown trigger="click"
                placement="bottom-end"
                @on-click="name => $emit('open-terminal', name)">
        <Button type="ghost">
          <Icon type="monitor"></Icon>
          登录终端
          <Icon type="arrow-down-b"></Icon>
        </Button>
        <DropdownMenu slot="list">
          <DropdownItem v-for="item in podList" :key="item.metadata.name"
                        :name="item.metadata.name">
            {{item.metadata.name}}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

    </div>
    <Modal title="水平扩展" v-model="hpaVisible" @on-ok="handleHPA" @on-cancel="hpaVisible = false">
      <div style="padding: 10px 15px;">
        <label for="">副本数：</label>
        <input-number v-model="hpaNumber"
                      :min="0"
                      :max="10000"
                      style="width: 200px;">
        </input-number>
      </div>
    </Modal>

    <RollingUpdateDialog v-model="rollingUpdateDialogVisible"
                         @submit="handleRollingUpdate">
    </RollingUpdateDialog>
  </Card>

</template>

<script>
  import _ from 'lodash'
  import dayjs from 'dayjs'
  import {COLORS} from '@/pars'
  import RollingUpdateDialog from './RollingUpdateDialog'

  export default {
    name: 'info-card',
    components: { RollingUpdateDialog },
    props: {
      info: Object,
      appResource: {
        type: Object,
        default: () => {}
      },
      podList: {
        type: Array,
        default: () => []
      },
      appAddress: Object,
    },
    data () {
      return {
        color: {...COLORS},
        expandReplicas: this.replicas,
        expandReplicasVisible: false,
        expandLoading: false,
        hpaVisible: false,
        hpaNumber: _.get(this.info, 'spec.replicas', 1),
        rollingUpdateDialogVisible: false,
        selectImageDialogVisible: false
      }
    },
    methods: {
      handleHPA () {
        this.$emit('hpa', this.hpaNumber)
      },
      onClickRestart () {
        this.$Modal.confirm({
          title: '重启应用',
          content: '<p>确定重启该应用吗？</p>',
          onOk: () => {
            this.$emit('restart')
          }
        })
      },
      onSelectImage (name) {
        this.form.image_name = name
        this.$refs.form.validateField('image_name')
        this.reloadImageTags()
      },
      handleRollingUpdate (formData) {
        this.$emit('rolling-update', formData)
        this.rollingUpdateDialogVisible = false
      }
    },
    computed: {
      name () {
        return this.$route.params.deploymentName
      },
      status () {
        const replicas = _.get(this.info, 'spec.replicas')
        const updatedReplicas = _.get(this.info, 'status.updatedReplicas')
        const availableReplicas = _.get(this.info, 'status.availableReplicas')
        return availableReplicas && (replicas ===  availableReplicas) ? '运行中' : '处理中'
      },
      kind () {
        const map = {
          'Deployment': '无状态应用'
        }
        return map[_.get(this.info, 'kind')]
      },
      user () {
        return _.get(this.info, 'metadata.labels["user/jd.com"]', 'Unknown')
      },
      statusColor () {
        return {
          '运行中': COLORS.success,
          '处理中': COLORS.error
        }[this.status]
      },
      image () {
        return _.get(this.info, 'spec.template.spec.containers.0.image')
      },

      cpuMemory () {
        const cpuUsage = _.get(this.appResource, 'cpu_usage', 0)
        const cpuRequest = _.get(this.appResource, 'cpu_request', 0)
        const cpuUtili = _.get(this.appResource, 'cpu_utili', 0)
        const memUsage = _.get(this.appResource, 'mem_usage', 0) / 1024 / 1024
        const memRequest = _.get(this.appResource, 'mem_request', 0) / 1024 / 1024
        const memUtili = _.get(this.appResource, 'mem_utili', 0)

        return {
          cpu: `${(cpuUtili > 0 && cpuUtili < 0.01) ? '小于1' : (cpuUtili * 100).toFixed(0)}% (${cpuUsage} / ${cpuRequest})`,
          memory: `${(memUtili > 0 && memUtili < 0.01) ? '小于1' : (memUtili * 100).toFixed(0)}% (${memUsage.toFixed(0) + 'M'} / ${memRequest.toFixed(0) + 'M'})`,
        }
      },
      createTime () {
        return dayjs(_.get(this.info, 'metadata.creationTimestamp', '')).format('YYYY/MM/DD HH:mm:ss')
      },
      podHealthStatus () {
        const replicas = _.get(this.info, 'spec.replicas')
        const updatedReplicas = _.get(this.info, 'status.updatedReplicas') || 0
        const availableReplicas = _.get(this.info, 'status.availableReplicas') || 0

        return {
          replicas,
          availableReplicas,
          availablePercent: (availableReplicas === 0 || availableReplicas === replicas) ? `${availableReplicas * 100 / replicas}%` : `${(availableReplicas * 100 / replicas).toFixed(2)}%`,
          updatedReplicas,
          updatedPercent: (updatedReplicas === 0 || updatedReplicas === replicas) ? `${updatedReplicas * 100 / replicas}%` : `${(updatedReplicas * 100 / replicas).toFixed(2)}%`
        }

      },
      desc () {
        return _.get(this.info, 'metadata.annotations["comment.jd.com"]') || '--'
      },
      replicas () {
        return _.get(this.info, 'spec.replicas', 0)
      }
    },
    watch: {
      info (newVal, oldVal) {
        if (!_.isEqual(_.get(newVal, 'spec.replicas'), _.get(oldVal, 'spec.replicas'))) {
          this.hpaNumber = _.get(newVal, 'spec.replicas')
        }
      }
    }
  }
</script>

<style lang="less" scoped>

  .custom-tag:not(.first) {
    margin-left: 10px;
  }
  .app-info {
    margin-bottom: 10px;
    p {
      padding: 2px;
    }
  }
  .app-desc {
    float: right;
    width: calc(100% - 45px);
    overflow: hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
    word-break: break-all;
  }
  .more-icon {
    display: inline-block;
    margin-left: 8px;
    vertical-align: middle;
  }

</style>


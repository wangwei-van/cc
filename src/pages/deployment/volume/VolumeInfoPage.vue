<template>
  <div class="form-page">
    <Breadcrumb class="custom-breadcrumb">
        <BreadcrumbItem>应用</BreadcrumbItem>
        <BreadcrumbItem :to="listPath">存储</BreadcrumbItem>
        <BreadcrumbItem>存储详情</BreadcrumbItem>
    </Breadcrumb>

    <Card>
      <p slot="title">
        {{volumeName}}
      </p>
      <Row class="app-info">
        <i-col span="6">
          <p>
            <span class="label-span">状态：</span>
            <Icon type="android-radio-button-on" :color="statusColor" v-if="info"></Icon>
            <span v-if="info">{{ status }}</span>
          </p>
          <p>
            <span class="label-span">访问模式</span>：
            <span>{{ accessMode }}</span>
          </p>


        </i-col>

        <i-col span="6">
          <p>
            <span class="label-span">容量</span>：
            <span>{{ capacity }}</span>
          </p>
          <p>
            <span class="label-span">创建时间</span>：
            <span>{{ createTime }}</span>
          </p>
        </i-col>

        <i-col span="12">
          <p>
            <span>存储池</span>：
            <span>{{ storageClass }}</span>
          </p>
        </i-col>
      </Row>
      <p class="info-row">
        <span class="label-span">使用者</span>：
        <a v-for="pod in pods" @click="goToPod(pod)">{{pod}}</a>
      </p>
      <p>
        <span class="label-span">备注</span>：
        <span class="app-desc">{{ comment || '-' }}</span>
      </p>

    </Card>

  </div>

</template>

<script>
  import _ from 'lodash'
  import dayjs from 'dayjs'
  import {COLORS} from '@/pars'

  export default {
    name: 'volume-info-page',
    props: {
      cluster: String,
      namespace: String,
      volumeName: String
    },
    data () {
      return {
        info: null,
      }
    },
    computed: {
      name () {
        return _.get(this.info, 'metadata.name')
      },
      status () {
        return _.get(this.info, ['metadata', 'annotations', 'jdjr.com/status'], 'Unknown')
      },
      statusColor () {
        return {
          Available: COLORS.success,
          UnAvailable: COLORS.warning,
          Used: COLORS.info,
          Lost: COLORS.error
        }[this.status]
      },
      storageClass () {
        return _.get(this.info, 'spec.storageClassName')
      },
      capacity () {
        return _.get(this.info, 'spec.resources.requests.storage')
      },
      comment () {
        return _.get(this.info, ['metadata', 'annotations', 'comment.jd.com'])
      },
      accessMode () {
        return _.get(this.info, 'spec.accessModes', []).join(', ')
      },
      createTime () {
        return dayjs(_.get(this.info, 'metadata.creationTimestamp')).format('YYYY-MM-DD HH:mm:ss')
      },
      listPath () {
        return {
          name: 'deploy-volume-list',
          params: this.$route.params
        }
      },
      pods () {
        const pods = _.get(this.info, ['metadata', 'annotations', 'jdjr.com/pods'])
        return pods ? pods.split(',') : []
      }
    },
    methods: {
      loadData() {
        this.$api.cluster(this.cluster).getVolumeInfo(this.namespace, this.volumeName)
          .then(res => {
            this.info = res.data
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取存储信息失败')
          })
      },
      goToPod (podName) {
        const deploymentName = podName.replace(/-\w+-\w+$/, '')

        this.$router.push({
          name: 'deploy-deployment-info',
          params: {
            ...this.$route.params,
            deploymentName
          }
        })
      }
    },
    created () {
      this.loadData()
    }
  }
</script>

<style lang="less" scoped>
  .app-info {
    p {
      margin-bottom: 10px;
    }
    /*.label-span {*/
      /*display: inline-block;*/
      /*width: 60px;*/
    /*}*/
  }
  .info-row {
    margin-bottom: 10px;
  }

</style>

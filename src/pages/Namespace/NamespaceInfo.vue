<template>
  <div>
    <Breadcrumb class="custom-breadcrumb">
      <BreadcrumbItem>项目</BreadcrumbItem>
      <BreadcrumbItem :to="backRoute">空间管理</BreadcrumbItem>
      <BreadcrumbItem>空间详情</BreadcrumbItem>
    </Breadcrumb>
    <Card dis-hover class="info-card">
      <p slot="title">
        {{namespaceName}}
      </p>
      <Steps :current="currentStep" style="width: 600px; margin: 5px 0;" size="small">
        <Step title="用户提交申请"></Step>
        <Step :title="status === 1 && action === 'Submit' ? '管理员审批（配额修改）' : '管理员审批'"></Step>
        <Step :title="action === 'Declined' ? '审批不通过' : '审批通过'"></Step>
      </Steps>

      <table class="info-table">
        <tr style="margin-bottom: 10px;">
          <td>状态： </td>
          <td style="width: 100px;">
            <Icon type="android-radio-button-on" :color="actionColor" v-if="info"></Icon>
            <span>{{actionMap[action]}}</span>
          </td>
          <td style="width: 70px;">创建时间： </td>
          <td>{{info.createtime}}</td>
          <td></td>
        </tr>
        <tr>
          <td>备注： </td>
          <td colspan="4">
            <div v-if="!commentEditing">
              <span>{{comment || '无'}}</span>
              <Icon class="table-tool-icon" type="compose" @click.native="onClickEditComment"></Icon>
            </div>
            <div v-if="commentEditing" style="width: 600px;">
              <i-input v-model="editText" style="display: inline-block; width: 400px;"></i-input>
              <Button type="success" icon="checkmark" @click="handleModifyComment" :loading="commentSubmitLoading"></Button>
              <Button icon="close" @click="commentEditing = false"></Button>
            </div>
          </td>
        </tr>
      </table>
      <div v-if="action === 'Submit'">
        <Button type="info" icon="ios-checkmark-outline" @click="handleApprove(true)">通过</Button>
        <Button type="default" icon="ios-close-outline" @click="handleApprove(false)">不通过</Button>
      </div>
    </Card>
    <Tabs type="card" class="custom-tabs" :animated="false">
      <TabPane label="成员" value="user">
        <User :cluster="cluster" :namespace-id="namespaceId"></User>
      </TabPane>
      <TabPane label="配额" value="quota">
        <Quota :cluster="cluster" :namespace-id="namespaceId" :info="info" @quota-modify="handleQuotaModify"></Quota>
      </TabPane>
      <TabPane label="历史记录" value="history">
        <History :histories="info.histories"></History>
      </TabPane>
    </Tabs>
  </div>

</template>

<script>
  import _ from 'lodash'
  import Quota from '../account/namespace-info/Quota'
  import User from '../account/namespace-info/User'
  import History from '../account/namespace-info/History'
  import {COLORS} from '@/pars'

  export default {
    name: 'namespace-info',
    components: { Quota, User, History },
    props: {
      cluster: String,
      namespaceId: String
    },
    data () {
      return {
        info: {},
        actionMap: {
          Submit: '审批中',
          Approved: '审批通过',
          Declined: '审批不通过'
        },
        commentEditing: false,
        editText: '',
        commentSubmitLoading: false
      }
    },
    computed: {
      backRoute () {
        return {
          name: 'namespace-list',
          params: {
            cluster: this.cluster
          }
        }
      },
      namespaceName () {
        return _.get(this.info, 'namespacename')
      },
      currentStep () {
        return _.get(this.info, 'action') === 'Submit' ? 1 : 3
      },
      comment () {
        return _.get(this.info, 'description')
      },
      status () {
        return _.get(this.info, 'status')
      },
      action () {
        return _.get(this.info, 'action')
      },
      actionColor () {
        return {
          Approved: COLORS.success,
          Submit: COLORS.warning,
          Declined: COLORS.error
        }[_.get(this.info, 'action')]
      }
    },
    methods: {
      loadInfo () {
        this.$api.namespace.getNamespaceInfo(this.namespaceId)
          .then(res => {
            const data = res.data.message
            this.info = _.merge({}, data.approvals, {
              histories: data.histories,
              status: data.namespace.status,
              createtime: data.namespace.createtime
            })
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取空间详情失败，请刷新重试')
          })
      },
      onClickEditComment () {
        this.editText = this.comment
        this.commentEditing = true
      },
      handleModifyComment () {
        this.commentSubmitLoading = true
        const formData = {
          description: this.editText
        }
        return this.$api.namespace.modifyNamespace(this.namespaceId, formData)
          .then(res => {
            this.$Message.success('修改成功')
            this.info.description = formData.description
            this.commentEditing = false
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '修改失败')
          })
          .then(() => {
            this.commentSubmitLoading = false
          })
      },
      handleApprove (isApproved) {
        this.$api.namespace.modifyNsApproval(this.info.id, {approved: isApproved})
          .then(res => {
            this.loadInfo()
            this.$Message.success('审批成功')
          })
      },
      handleQuotaModify () {
        this.loadInfo()
      }
    },
    mounted () {
      this.loadInfo()
    },
    watch: {
      cluster () {
        this.$router.push({name: 'namespace-list', params: this.$route.params})
      }
    }
  }
</script>

<style lang="less" scoped>
  .info-card {
    margin-bottom: 10px;
  }
  .info-table {
    td {
      /*padding: 5px;*/
      height: 32px;
    }

  }

</style>

<template>
  <div>
    <Breadcrumb class="custom-breadcrumb">
      <BreadcrumbItem>账户</BreadcrumbItem>
      <BreadcrumbItem :to="backRoute">我的空间</BreadcrumbItem>
      <BreadcrumbItem>空间详情</BreadcrumbItem>
    </Breadcrumb>
    <Card dis-hover class="info-card">
      <p slot="title">
        {{namespaceName}}
      </p>
      <Steps :current="currentStep"
             style="width: 600px; margin: 5px 0;"
             size="small"
             v-if="status === 0 || (status === 1 && action === 'Submit')">
        <Step title="用户提交申请"></Step>
        <Step :title="status === 1 && action === 'Submit' ? '管理员审批（配额修改）' : '管理员审批'" content=""></Step>
        <Step :title="action === 'Declined' ? '审批未通过' : '审批通过'" content=""></Step>
      </Steps>

      <table class="info-table">
        <tr style="margin-bottom: 10px;">
          <td>状态： </td>
          <td style="width: 100px;">
            <Icon type="android-radio-button-on" :color="statusColor" v-if="info"></Icon>
            <span>{{statusMap[status]}}</span>
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
  import Quota from './Quota'
  import User from './User'
  import History from './History'
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
        statusMap: {
          0: '处理中',
          1: '已激活'
        },
        commentEditing: false,
        editText: '',
        commentSubmitLoading: false
      }
    },
    computed: {
      backRoute () {
        return {
          name: 'account-namespace-list',
          params: {
            cluster: this.cluster
          }
        }
      },
      namespaceName () {
        return _.get(this.info, 'name')
      },
      action () {
        return _.get(this.info, 'action')
      },
      status () {
        return _.get(this.info, 'status')
      },
      currentStep () {
        return (this.status === 0 && this.action !== 'Declined') || (this.status === 1 && this.action === 'Submit') ? 1 : 3
      },
      comment () {
        return _.get(this.info, 'description')
      },
      statusColor () {
        return {
          1: COLORS.success,
          0: COLORS.warning,
          2: COLORS.error
        }[this.status]
      }
    },
    methods: {
      loadInfo () {
        this.$api.namespace.getNamespaceInfo(this.namespaceId)
          .then(res => {
            this.info = _.merge(res.data.message.namespace, {
              action: _.get(res.data.message.approvals, 'action'),
              histories: res.data.message.histories
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

<template>
  <div style="padding: 20px 20px; position: relative; height: 100%">
    <portal to="cluster">
      <ClusterSelect :value="cluster"
                     :clusters="$store.state.clusterList"
                     @on-change="handleClusterChange">
      </ClusterSelect>
    </portal>
    <portal to="namespace" v-if="$store.state.clusterList.length > 0">
      <NamespaceSelect :value="namespace"
                       :namespaces="$store.state.namespaceList">
      </NamespaceSelect>
    </portal>

    <router-view v-if="cluster && namespace"></router-view>
    <div v-else-if="!cluster" class="empty-tips">
      <p>抱歉，当前没有可用的集群 :（</p>
    </div>
    <div v-else class="empty-tips">
      <p>抱歉，当前集群下没有可用的项目空间 :（</p>
      <p>赶快去<a @click="goToNamespace">创建</a>一个吧</p>
    </div>
  </div>

</template>

<script>
  import ClusterSelect from '../common/ClusterSelect'
  import NamespaceSelect from '../common/NamespaceSelect'
  import store from '@/store'
  import api from '@/api'
  import _ from 'lodash'

  export default {
    name: "ClusterNamespace",
    components: { ClusterSelect, NamespaceSelect },
    props: {
      cluster: String,
      namespace: String,
    },
    methods: {
      handleClusterChange (cluster) {
        localStorage.setItem('cluster', cluster)
        api.namespace.listNamespace(cluster)
          .then(res => {
            const namespaces = _.filter(res.data.message, item => item.status ===1)
            store.commit('setNamespaceList', namespaces)
            this.$router.push({name: this.$route.name, params: {
              cluster: cluster,
              namespace: _.get(namespaces, '0.name')
            }})
          })
          .catch(err => {
            this.$NoticeAjaxError(err, '获取集群的项目空间列表失败')
          })
      },
      goToNamespace () {
        this.$router.push({
          name: 'account-namespace-list',
          params: {...this.$route.params}
        })
      }
    },
    beforeRouteEnter (to, from, next) {
      const checkProps = function () {
        const clusterNameList = store.state.clusterList.map(item => item.metadata.name)
        let cluster = to.params.cluster || localStorage.getItem('cluster')
        if (!clusterNameList.includes(cluster)) {
          cluster = clusterNameList[0]
        }

        api.namespace.listNamespace(cluster)
          .then(res => {
            // 过滤掉状态不可用的ns
            const namespaces = _.filter(res.data.message, item => item.status ===1)
            store.commit('setNamespaceList', namespaces)
            const namespaceNameList = namespaces.map(item => item.name)
            let namespace = (to.params.namespace !== 'null' && to.params.namespace ) || localStorage.getItem('namespace')
            if (!namespaceNameList.includes(namespace)) {
              namespace = namespaceNameList[0]
            }

            // 登录时，params为空，需要初始化值
            if (_.isEmpty(to.params) || to.params.namespace !== namespace) {
              next({
                name: to.name,
                params: {
                  cluster,
                  namespace
                }
              })
            } else {
              next()
            }
          })
        }

      if (!store.state.clusterList) {
        api.listCluster()
          .then(res => {
            store.commit('setClusterList', res.data.items)
            checkProps()
          })
          .catch(err => {
            // todo 页面显示异常信息
            console.log(err)
          })
      } else {
        checkProps()
      }
    },
  }
</script>

<style lang="less" scoped>
  .empty-tips {
    margin-top: 150px;
    text-align: center;
    p {
      font-size: 20px;
      font-weight: 600;
      text-shadow: 0 0 5px lightgrey;
    }
    a {
      color: #f44336;
    }
  }
</style>

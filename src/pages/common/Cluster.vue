<template>
  <div style="padding: 20px 20px; position: relative; height: 100%">
    <portal to="cluster">
      <label>集群 :</label>
      <span v-if="$store.state.clusterList.length === 0">无可用集群</span>
      <Dropdown @on-click="handleItemClick" v-else
                style="padding-left: 15px;"
                trigger="click"
                placement="bottom-start">
        <a href="javascript:void(0)">
          <span>{{cluster}}</span>
          <Icon type="arrow-down-b" :style="{marginLeft: '5px'}"></Icon>
        </a>
        <DropdownMenu slot="list">
          <DropdownItem v-for="item in $store.state.clusterList"
                        :name="item.metadata.name"
                        :key="item.metadata.name"
                        :selected="item.metadata.name === cluster">
            {{item.metadata.name}}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </portal>
    <router-view v-if="cluster"></router-view>
    <div v-else class="empty-tips">
      <p>抱歉，当前没有可用的集群 :（</p>
    </div>
  </div>

</template>

<script>
  import api from '@/api'
  import store from '@/store'

  export default {
    name: "Cluster",
    props: {
      cluster: String,
    },
    data () {
      return {
      }
    },
    methods: {
      handleItemClick (value) {
        localStorage.setItem('cluster', value)
        const params = {
          ...this.$route.params,
          cluster: value
        }
        this.$router.push({name: this.$route.name, params: params})
      }
    },
    beforeRouteEnter (to, from, next) {
      const checkCluster = function () {
        const clusters = store.state.clusterList.map(item => item.metadata.name)
        let cluster = (to.params.cluster !== 'null' & to.params.cluster) || localStorage.getItem('cluster')
        if (!clusters.includes(cluster)) {
          cluster = clusters[0]
        }

        if (_.isEmpty(to.params) || to.params.cluster !== cluster) {
          next({
            name: to.name,
            params: {
              cluster: cluster
            }
          })
        } else {
          next()
        }
      }

      if (!store.state.clusterList) {
        api.listCluster()
          .then(res => {
            store.commit('setClusterList', res.data.items)
            checkCluster()
          })
          .catch(err => {
            // todo 异常处理
            console.log(err)
          })
      } else {
        checkCluster()
      }
    }
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

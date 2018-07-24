import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    username: null,
    realname: null,
    clusterList: null,
    namespaceList: null
  },
  mutations: {
    setClusterList (state, clusterList) {
      state.clusterList = clusterList
    },
    setNamespaceList (state, namespaceList) {
      state.namespaceList = namespaceList
    },
    setCurrentUser (state, userInfo) {
      state.username = userInfo.username
      state.realname = userInfo.realname
    }
  }
})

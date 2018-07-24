import axios from 'axios'

export default {
  listNamespaceInfo (cluster, namespace) {
    return axios.get(`/metrics/${cluster}/api/v1/namespaces/${namespace}/global_info`)
  },
}

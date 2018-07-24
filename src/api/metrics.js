import axios from 'axios'

export default {
  // 集群metrics
  listClusterUtili (cluster) {
    return axios.get(`/metrics/${cluster}/api/v1/cluster/history`)
  },

  // 主机列表
  listClusterHosts (cluster) {
    return axios.get(`/metrics/${cluster}/api/v1/host_info_list`)
  },
  // 单个主机metrics
  listHostUtili (cluster, host) {
    return axios.get(`/metrics/${cluster}/api/v1/hosts/${host}/history`)
  },

  listNamespaceApps (cluster, namespace) {
    return axios.get(`/metrics/${cluster}/api/v1/namespaces/${namespace}/app_info_list`)
  },

  // namespace app metrics
  listNamespaceAppResource (cluster, namespace) {
    return axios.get(`/metrics/${cluster}/api/v1/namespaces/${namespace}/app_info_list`)
  },
  getAppResource (cluster, namespace, appName) {
    return axios.get(`/metrics/${cluster}/api/v1/namespaces/${namespace}/apps/${appName}/metrics_info`)
  },
  listAppHistory (cluster, namespace, appName) {
    return axios.get(`/metrics/${cluster}/api/v1/namespaces/${namespace}/apps/${appName}/history`)
  },

  // app pods metrics
  listPodResource (cluster, namespace, appName) {
    return axios.get(`/metrics/${cluster}/api/v1/namespaces/${namespace}/apps/${appName}/pod_info_list`)
  },
  // 单个pod metrics
  listPodHistory (cluster, namespace, podName) {
    return axios.get(`/metrics/${cluster}/api/v1/namespaces/${namespace}/pods/${podName}/history`)
  },
  // 获取空间的应用访问路径列表
  listEndpoints (cluster, namespace) {
    return axios.get(`/metrics/${cluster}/api/v1/namespaces/${namespace}/apps/endpoints`)
  },
  // 获取某一应用的访问路径列表
  getAppEndpoints (cluster, namespace, deploymentName) {
    return axios.get(`/metrics/${cluster}/api/v1/namespaces/${namespace}/apps/${deploymentName}/endpoints`)
  }
}

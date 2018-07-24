import axios from 'axios'

export default {
  getPodPeriodLog (cluster, namespace, podName, config) {
    config.baseURL = '/'
    const thisConfig = {
      ...this.config,
      ...config
    }
    return axios.get(`/essqlx/api/v1/pods/${podName}?cluster=${cluster}&namespace=${namespace}`, thisConfig)
  },

  getAuditLogs (cluster, config) {
    config.baseURL = '/'
    const thisConfig = {
      ...this.config,
      ...config
    }
    return axios.get(`/essqlx/api/v1/audit?cluster=${cluster}`, thisConfig)
  }
}

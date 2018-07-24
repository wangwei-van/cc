import axios from 'axios'

export default {
  listConfigs (type, namespace) {
    return axios.get(`/api/v1/namespaces/${namespace}/${type}s`, this.config)
  },
  getConfigInfo (type, namespace, name) {
    return axios.get(`/api/v1/namespaces/${namespace}/${type}s/${name}`, this.config)
  },
  createConfig (type, namespace, formData) {
    return axios.post(`/api/v1/namespaces/${namespace}/${type}s`, formData, this.config)
  },
  patchConfig (type, namespace, name, formData) {
    const config = {
      ...this.config,
      headers: {
        'Content-Type': 'application/strategic-merge-patch+json'
      }
    }
    return axios.patch(`/api/v1/namespaces/${namespace}/${type}s/${name}`, formData, config)
  },
  deleteConfigs (namespace, configList) {
    return Promise.all(configList.map(config =>
      axios.delete(`/api/v1/namespaces/${namespace}/${config.type}s/${config.name}`, this.config)
    ))
  },
}
import axios from 'axios'

export default {
  listPipelines (namespace, params) {
    const config = {
      params,
      ...this.config
    }
    return axios.get(`/apis/jd.com/v1alpha1/namespaces/${namespace}/pipelines`, config)
  },
  getPipelineInfo (namespace, name) {
    return axios.get(`/apis/jd.com/v1alpha1/namespaces/${namespace}/pipelines/${name}`, this.config)
  },
  createPipeline (namespace, formData) {
    return axios.post(`/apis/jd.com/v1alpha1/namespaces/${namespace}/pipelines`, formData, this.config)
  },
  patchPipeline (namespace, patchData) {
    const config = {
      ...this.config,
      headers: {
        'Content-Type': 'application/strategic-merge-patch+json'
      }
    }
    return axios.patch(`/apis/jd.com/v1alpha1/namespaces/${namespace}/pipelines`, patchData, config)
  },
  deletePipelines (namespace, nameList) {
    return Promise.all(nameList.map(name =>
      axios.delete(`/apis/jd.com/v1alpha1/namespaces/${namespace}/pipelines/${name}`, this.config)
    ))
  },

  getWorkflowInfo (namespace, name) {
    return axios.get(`/apis/argoproj.io/v1alpha1/namespaces/${namespace}/workflows/${name}`, this.config)
  },


  getAllPlugins () {
    return axios.get(`/v1/plugins`, {baseURL: '/'})
  },

  listCompile (namespace) {
    return axios.get(`/v1/namespaces/${namespace}/compiles`, this.config)
  },

  createCompile (namespace, formData) {
    return axios.post(`/v1/namespaces/${namespace}/compiles`, formData, this.config)
  },

  launchCompile (namespace, name) {
    return axios.post(`/v1/namespaces/${namespace}/compiles/${name}`, {}, this.config)
  }
}
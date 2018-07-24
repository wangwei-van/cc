import axios from 'axios'

export default {
  listAllIngresses () {
    return axios.get(`/apis/extensions/v1beta1/ingresses`, this.config)
  },
  listNamespaceIngresses (namespace) {
    return axios.get(`/apis/extensions/v1beta1/namespaces/${namespace}/ingresses`, this.config)
  },

  getIngressInfo (namespace, name) {
    return axios.get(`/apis/extensions/v1beta1/namespaces/${namespace}/ingresses/${name}`, this.config)
  },
  getIngressesInfo (namespace, names) {
    return Promise.all(names.map(name =>
      axios.get(`/apis/extensions/v1beta1/namespaces/${namespace}/ingresses/${name}`, this.config)
    ))
  },

  deleteIngress (namespace, name) {
    return axios.delete(`/apis/extensions/v1beta1/namespaces/${namespace}/ingresses/${name}`, this.config)
  },
  deleteIngresses (namespace, names) {
    return Promise.all(names.map(name =>
      axios.delete(`/apis/extensions/v1beta1/namespaces/${namespace}/ingresses/${name}`, this.config)
    ))
  },

  createIngress (namespace, formData) {
    return axios.post(`/apis/extensions/v1beta1/namespaces/${namespace}/ingresses`, formData, this.config )
  },
  createIngresses (namespace, arr) {
    return Promise.all(arr.map(formData =>
      axios.post(`/apis/extensions/v1beta1/namespaces/${namespace}/ingresses`, formData, this.config)
    ))
  }
}
import axios from 'axios'
import _ from 'lodash'

const baseURL = '/uim/api/v1'

export default {
  // 后台管理门户需要获取所有的ns，不根据用户请求过滤
  listNamespace (cluster, system) {
    const config = {
      baseURL: baseURL,
      params:  {cluster}
    }
    let url = '/usernamespaces/namespaces/'
    if (system === 'operation') url = '/namespaces'
    return axios.get(url, config)
  },
  createNamespace (formData) {
    return axios.post('/namespaces', formData, {baseURL})
  },
  deleteNamespaces (namespaceIds) {
    return Promise.all(namespaceIds.map(
      id => axios.delete(`/namespaces/${id}`, {baseURL})
    ))
  },
  modifyNamespace (namespaceId, formData) {
    return axios.put(`/namespaces/${namespaceId}`, formData, {baseURL})
  },
  getNamespaceInfo (namespaceId) {
    return axios.get(`/namespaces/${namespaceId}`, {baseURL})
  },


  // ns审批
  listNsApproval (params) {
    return axios.get(`/nsapprovals`, {baseURL})
  },
  modifyNsApproval (namespaceId, formData) {
    return axios.put(`/nsapprovals/${namespaceId}`, formData, {baseURL})
  },

  addNamespaceUser (formData) {
    return axios.post('/usernamespaces/', formData, {baseURL})
  },
  removeNamespaceUser (usernames, namespace, cluster) {
    const getData = name => ({
      user: name,
      namespace,
      cluster
    })
    return Promise.all(usernames.map(
      name => axios.delete('/usernamespaces/', {baseURL, params: getData(name)})
    ))
  },
  setUserNamespaceRole (username, namespaceId, userrole) {
    return axios.put(
      '/usernamespaces/',
      {userrole},
      {baseURL, params: {user: username, namespace: namespaceId}}
    )
  },

  listNamespaceUsers (namespaceId) {
    return axios.get('/usernamespaces/users/', {baseURL, params: {namespace: namespaceId}})
  },
  deleteNamespaceUsers (usernames, namespaceId, cluster) {
    const getConfig = name => ({
      baseURL,
      params: {
        user: name,
        namespace: namespaceId,
        cluster: cluster
      }
    })
    return Promise.all(usernames.map(name =>
      axios.delete('/usernamespaces/', getConfig(name))
    ))
  },
}

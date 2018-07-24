import axios from 'axios'
const YAML2JSON = require("js-yaml");

const Prefix = '/registry'

export default {
  listImage (params) {
    return axios.get('/v2/_catalog', {params, baseURL: Prefix})
  },
  searchImage (imageName) {
    return axios.get(`/v2/${imageName}/tags/list`, {baseURL: Prefix})
  },
  listImageTag (repository) {
    return axios.get(`/v2/${repository}/tags/list`, {baseURL: Prefix})
  },
  // 从 helm 获取yaml文件
  getPackageList (repository) {
    return axios.get(`/helm/${repository}/index.yaml`)
      .then(res => {
        return YAML2JSON.safeLoad(res.data)
      })
  },
  // 获取package的详细内容
  getPackageInfo (repository, name, version) {
    return axios.get(`/helm/${repository}/${name}-${version}.zip`, {responseType: 'blob'})
  },
  // 获取 release 列表
  listRelease (cluster, namespace) {
    return axios.get(`/helmsman/v1/cluster/${cluster}/namespaces/${namespace}/releases`)
  },
  getReleaseInfo (cluster, namespace, release) {
    return axios.get(`/helmsman/v1/cluster/${cluster}/namespaces/${namespace}/releases/${release}`)
  },
  createRelease (cluster, namespace, yaml) {
    return axios.post(`/helmsman/v1/cluster/${cluster}/namespaces/${namespace}/releases`, yaml)
  }

}

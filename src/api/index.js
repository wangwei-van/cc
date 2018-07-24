import axios from 'axios'
import DeploymentMixin from './deployment'
import IngressMixin from './ingress'
import ConfigMixin from './config'
import PipelineMixin from './pipeline'
import overview from './overview'
import metrics from './metrics'
import log from './log'
import image from './images'
import user from './user'
import namespace from './namespace'

// axios.defaults.baseURL = 'https://apigw.example.com:8143'
// axios.defaults.headers.common['Authorization'] = 'Bearer ' +
//   'eyJhbGciOiJSUzI1NiIsImtpZCI6IjAzZjJiYmI2MWQzMmNkOTI4MDg4MzIyZjlmNTY3ZmQ3NGExOTMwZTEifQ.eyJpc3MiOiJodHRwczovL2FwaWd3LmV4YW1wbGUuY29tOjgxNDMvZGV4Iiwic3ViIjoiQ2docWNuTm9ZV3hsYVJJR2FtUm1iV2QwIiwiYXVkIjoidWltIiwiZXhwIjoxNTMwMzQ1MjcyLCJpYXQiOjE1MzAyNTg4NzIsImF0X2hhc2giOiI2TDhVNnRTbmRtb1BFcnRlYVl3NVp3IiwiZW1haWwiOiJqcnNoYWxlaUBqZC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6Impyc2hhbGVpIn0.bSlrv9NBMABFO-GZKr2WlgDz7hoR4PLRP2TZn41qcYQgfhc5NN3DNp1rF82k6LtCB2JyJ6mjc6z1GTDoEhgRI792ZPFtaoS2ci8h4ItS30kwCf4yHy8UIGn3ZX6QwiRPOUks9mWo9eGG36MGnFCPBYGKjJ3LMv3UYqTrolzr9ULhgsLIVRzNaOl3T_fSanT1BXN-Wfh_qWXnBGa-YnLUuuvjCgPepFxB4D4aTimP6TnLkJ0r5Ow4d9GMSoY-PDhufwY20aSF0LKOolquMt2kyhqY-GHd1lC-_RBAL-naEWnDtXwN2VdX9dkYrhpBum6iO1Oay4oeZiGd14Mu_jNrTw'

// 登录过期，拦截提示刷新页面
axios.interceptors.response.use(response => response, error => {
  console.log(error)
  if (_.get(error, 'response.status') === 401) {
    Vue.prototype.$Modal.confirm({
      title: '确定跳转',
      content: '<p>用户登录或登录超时，确定刷新页面吗？</p>',
      onOk: () => {
        // const currentHref = window.location.href
        window.location.href = '/manage'
      }
    })
  }
  return Promise.reject(error)
})


const ClusterApi = function (clusterName) {
  this.clusterName = clusterName
  this.config = {
    baseURL: `/clusters/${clusterName}`,
  }
}

ClusterApi.prototype = {
  ...DeploymentMixin,
  ...IngressMixin,
  ...ConfigMixin,
  ...PipelineMixin,
}


export default {
  cluster (clusterName) {
    return new ClusterApi(clusterName)
  },
  listCluster () {
    return axios.get('/clusters/system/apis/jd.com/v1alpha1/clusters?limit=500')
  },
  overview,
  image,
  user,
  namespace,
  metrics,
  log
}

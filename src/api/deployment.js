import axios from 'axios'
import _ from 'lodash'

function getLabelSelector (labels) {
  const labelSelectorList = []
  for (const key in labels) {
    if (labels.hasOwnProperty(key)) {
      labelSelectorList.push(`${key}=${labels[key]}`)
    }
  }
  return labelSelectorList.join(',')
}

export default {
  /*********** Deployment **************/
  listDeployments (namespace) {
    return axios.get(`/apis/extensions/v1beta1/namespaces/${namespace}/deployments`, this.config)
  },
  getDeploymentInfo (namespace, deploymentName) {
    return axios.get(`/apis/extensions/v1beta1/namespaces/${namespace}/deployments/${deploymentName}`, this.config)
  },
  deleteDeployments (namespace, names) {
    return Promise.all(names.map(name =>
      axios.delete(`/apis/apps/v1/namespaces/${namespace}/deployments/${name}`, this.config)
    ))
  },
  createDeployment (namespace, formData) {
    return axios.post(`/apis/extensions/v1beta1/namespaces/${namespace}/deployments`, formData, this.config)
  },
  putDeployment (namespace, name, formData) {
    return axios.put(`/apis/extensions/v1beta1/namespaces/${namespace}/deployments/${name}`, formData, this.config)
  },
  listIpPools (namespace) {
    return axios.get(`/apis/jd.com/v1alpha1/namespaces/${namespace}/ippools`, this.config)
  },
  hpaDeployment (namespace, deploymentName, replicas) {
    const patchData = {
      spec: {
        replicas: replicas
      }
    }
    return this.patchDeployment(namespace, deploymentName, patchData)
  },
  restartDeploymentList (namespace, deploymentInfoList) {
    return Promise.all(deploymentInfoList.map(
      info => this.restartDeployment(namespace, info)
    ))
  },
  restartDeployment (namespace, deploymentInfo) {
    return this.listPods(namespace, deploymentInfo)
      .then(res => {
        const podList = res.data.items
        return Promise.all(podList.map(
          pod => this.deletePod(namespace, pod.metadata.name)
        ))
      })
  },
  rollingUpdateDeployment (namespace, deploymentName, formData) {
    const patchData = {
      spec: {
        template: {
          spec: {
            containers: [
              {
                name: deploymentName,
                image: `${formData.image_name}:${formData.image_tag}`
              }
            ]
          }
        }
      }
    }
    return this.patchDeployment(namespace, deploymentName, patchData)
  },
  patchDeployment (namespace, deploymentName, patchData) {
    const config = {
      ...this.config,
      headers: {
        'Content-Type': 'application/strategic-merge-patch+json'
      }
    }
    return axios.patch(`/apis/extensions/v1beta1/namespaces/${namespace}/deployments/${deploymentName}`,
      patchData,
      config
    )
  },

  /*********** Pod **************/
  getDeploymentLabels (deploymentInfo) {
    let labels = _.get(deploymentInfo, 'metadata.labels')
    if (!labels) {
      labels = _.get(deploymentInfo, 'spec.selector.matchLabels')
    }
    return {app: labels.app}
  },
  getPodLog (namespace, podName, config) {
    const thisConfig = {
      ...this.config,
      ...config
    }
    return axios.get(`/api/v1/namespaces/${namespace}/pods/${podName}/log`, thisConfig)
  },

  listPods (namespace, deploymentInfo) {
    const labels = this.getDeploymentLabels(deploymentInfo)
    if (!labels) {
      return Promise.reject('deployment info 没有找到labels')
    }
    const config = {
      ...this.config,
      params: {
        labelSelector: getLabelSelector(labels),
        limit: 500
      }
    }
    return axios.get(`/api/v1/namespaces/${namespace}/pods`, config)
  },
  getPodInfo (namespace, podName) {
    return axios.get(`/api/v1/namespaces/${namespace}/pods/${podName}`, this.config)
  },
  deletePod (namespace, name) {
    return axios.delete(`/api/v1/namespaces/${namespace}/pods/${name}`, this.config)
  },
  listPodEvents (namespace, fieldSelector) {
    const config = {
      ...this.config,
      params: {
        'fieldSelector': getLabelSelector(fieldSelector)
      }
    }
    return axios.get(`/api/v1/namespaces/${namespace}/events`, config)
  },
  patchPodEvent (namespace, name, patchData) {
    const config = {
      ...this.config,
      headers: {
        'Content-Type': 'application/strategic-merge-patch+json'
      }
    }
    return axios.patch(`/api/v1/namespaces/${namespace}/events/${name}`, patchData, config)
  },
  connectPodTerminal (podName) {
    return new WebSocket(`ws:///pod-terminal/${podName}`)
  },

  /************** services **********/
  listServices (namespace) {
    return axios.get(`/api/v1/namespaces/${namespace}/services`, this.config)
  },
  createServices (namespace, formData) {
    return axios.post(`/api/v1/namespaces/${namespace}/services`, formData, this.config)
  },
  deleteService (namespace, name) {
    return axios.delete(`/api/v1/namespaces/${namespace}/services/${name}`, this.config)
  },
  deleteServices (namespace, names) {
    return Promise.all(names.map(name =>
      axios.delete(`/api/v1/namespaces/${namespace}/services/${name}`, this.config)
    ))
  },
  patchService (namespace, name, patchData) {
    let config = this.config
    _.set(config, 'headers.Content-Type', 'application/merge-patch+json')
    // config.headers['Content-Type'] = 'application/merge-patch+json'
    return axios.patch(`/api/v1/namespaces/${namespace}/services/${name}`, patchData, config)
  },

  /************** horizontalpodautoscalers **********/
  listHpas (namespace) {
    return axios.get(`/apis/autoscaling/v2beta1/namespaces/${namespace}/horizontalpodautoscalers`, this.config)
  },

  getHpa (namespace, name) {
    return axios.get(`/apis/autoscaling/v2beta1/namespaces/${namespace}/horizontalpodautoscalers/${name}`, this.config)
  },

  createHpa (namespace, formData) {
    return axios.post(`/apis/autoscaling/v2beta1/namespaces/${namespace}/horizontalpodautoscalers`, formData, this.config)
  },

  deleteHpa (namespace, name) {
    return axios.delete(`/apis/autoscaling/v2beta1/namespaces/${namespace}/horizontalpodautoscalers/${name}`, this.config)
  },
  deleteHpas (namespace, names) {
    return Promise.all(names.map(name =>
      axios.delete(`/apis/autoscaling/v2beta1/namespaces/${namespace}/horizontalpodautoscalers/${name}`, this.config)
    ))
  },

  patchHpa (namespace, name, patchData) {
    const config = {
      ...this.config,
      headers: {
        'Content-Type': 'application/strategic-merge-patch+json'
      }
    }
    return axios.patch(`/apis/autoscaling/v2beta1/namespaces/${namespace}/horizontalpodautoscalers/${name}`, patchData, config)
  },

  /************** volumes **********/
  listVolumes (namespace) {
    const config = {
      ...this.config,
      params: {limit: 500}
    }
    return axios.get(`/api/v1/namespaces/${namespace}/persistentvolumeclaims`, config)
  },
  deleteVolumes (namespace, nameList) {
    return Promise.all(nameList.map(name =>
      axios.delete(`/api/v1/namespaces/${namespace}/persistentvolumeclaims/${name}`, this.config)
    ))
  },
  patchVolumes (namespace, volName, formData) {
    const config = {
      ...this.config,
      headers: {
        'Content-Type': 'application/strategic-merge-patch+json'
      }
    }
    return axios.patch(`/api/v1/namespaces/${namespace}/persistentvolumeclaims/${volName}`, formData, config)
  },
  createVolume (namespace, formData) {
    return axios.post(`/api/v1/namespaces/${namespace}/persistentvolumeclaims`, formData, this.config)
  },
  getVolumeInfo (namespace, volName) {
    return axios.get(`/api/v1/namespaces/${namespace}/persistentvolumeclaims/${volName}`, this.config)
  },
  listStorageClasses () {
    return axios.get('/apis/storage.k8s.io/v1/storageclasses?limit=500', this.config)
  },
  listVolumesStatus () {
    return axios.get('/api/v1/persistentvolumes', this.config)
  }

}

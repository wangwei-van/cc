import _ from 'lodash'
import store from '@/store'

const createTemplate = {
  "kind": "Deployment",
  "apiVersion": "extensions/v1beta1",
  "metadata": {
    "name": "",
    "namespace": "",
    "labels": {
      "app": ""
    },
    "annotations": {
      "comment.jd.com": "",
      "services.jd.com": "",
      "ingress.jd.com": "",
      "ingressAddr.jd.com": "",
    }
  },
  "spec": {
    "replicas": 0,
    "selector": {
      "matchLabels": {
        "app": ""
      }
    },
    "template": {
      "metadata": {
        "labels": {
          "app": ""
        }
      },
      "spec": {
        "volumes": [
          // {
          //   name: 'zookeeper-data',
          //   persistentVolumeClaim: { claimName: 'zookeeper-vol' }
          // }
        ],
        "containers": [
          {
            "name": "",
            "image": "",
            "ports": [
              // {
              //   "containerPort": 80,
              //   "protocol": "TCP"
              // }
            ],
            "env": [],
            "resources": {
              "limits": {},
              "requests": {}
            },
            "volumeMounts": [
              // { mountPath: '/data', name: 'zookeeper-data' }
            ]
          }
        ]
      }
    },
  }
}

const ServiceTemplate = {
  "apiVersion":"v1",
  "kind":"Service",
  "metadata":{
    "name": "",
    "namespace": "",
    "labels":{
      "app": ""
    },
    "ownerReferences": [{
      "apiVersion": 'extensions/v1beta1',
      "blockOwnerDeletion": true,
      "controller": true,
      "kind": 'Deployment',
      "name": null,
      "uid": null
    }]
  },
  "spec":{
    "ports":[],
    "selector": {
      "app": ""
    }
  }
}

const ingressTemplate = {
  apiVersion: 'extensions/v1beta1',
  kind: 'Ingress',
  metadata: {
    name: null,
    annotations: {
      'kubernetes.io/ingress.class': 'nginx',
      'nginx.ingress.kubernetes.io/ssl-redirect': 'false'
    }
  },
  spec: {
    rules: []
  }
}

const trimLastEmpty = function (data, omitKeys) {
  let total = 0
  _.forOwn(data[data.length - 1], (value, key) => {
    if (value) {
      omitKeys ? (!omitKeys.includes(key) && total++) : total++
    }
  })
  if (total === 0) {
    return data.slice(0, -1)
  }
  return data
}

// 从formData获取创建Deployment的Json数据
const getAppJson = function (formData) {
  formData = _.cloneDeep(formData)
  const output = _.cloneDeep(createTemplate)
  const keyMap = {
    name: [
      'metadata.name',
      'spec.selector.matchLabels.app',
      'metadata.labels.app',
      'metadata.annotations["services.jd.com"]',
      'spec.template.metadata.labels.app',
      'spec.template.spec.containers.0.name'
    ],
    desc: 'metadata.annotations["comment.jd.com"]',
    namespace: 'metadata.namespace',
    replicas: 'spec.replicas',
    'resources.0': [
      'spec.template.spec.containers.0.resources.limits.cpu',
      'spec.template.spec.containers.0.resources.requests.cpu'
    ],
    'resources.1': [
      'spec.template.spec.containers.0.resources.limits.memory',
      'spec.template.spec.containers.0.resources.requests.memory'
    ],
    port_pars: 'spec.template.spec.containers.0.ports',
  }
  _.mapKeys(keyMap, (jsonKey, formKey) => {
    let value = _.get(formData, formKey)
    if (formKey === 'port_pars') {
      value = trimLastEmpty(value, ['protocol'])
    }
    if (value) {
      [].concat(jsonKey).map(key => {
        _.set(output, key, value)
      })
    }
  })

  // ingress annotations
  if (formData.external_slb_rules && formData.external_slb_rules.length > 0) {
    _.set(output, 'metadata.annotations["ingress.jd.com"]', _.map(formData.external_slb_rules, (item, idx) => `${formData.name}-${idx}`).join('/'))
    _.set(output, 'metadata.annotations["ingressAddr.jd.com"]', _.map(formData.external_slb_rules, item => item.host).join('/'))
  }

  // user create/update
  _.set(output, 'metadata.labels["user/jd.com"]', output.user || store.state.username)

  // image
  _.set(output, 'spec.template.spec.containers[0].image', `${formData.image_name}:${formData.image_tag}`)


  // 启动命令
  if (formData.command) {
    _.set(output, 'spec.template.spec.containers[0].command', formData.command.split(' '))
  }

  // 环境变量
  const envParsData = trimLastEmpty(formData.env_pars, ['config'])
  _.map(envParsData, item => {
    if (typeof(item.config) === 'string') {
      output.spec.template.spec.containers[0].env.push({
        name: item.name,
        value: item.value
      })
    } else if (typeof(item.config) === 'object') {
      const type = item.config.id.substring(item.config.id.lastIndexOf('-') + 1)
      let valueFrom
      if (type === 'configmap') {
        valueFrom = {
          configMapKeyRef: {
            name: item.config.metadata.name,
            key: item.config.key
          }
        }
      } else if (type === 'secret') {
        valueFrom = {
          secretKeyRef: {
            name: item.config.metadata.name,
            key: item.config.key
          }
        }
      }
      output.spec.template.spec.containers[0].env.push({
        name: item.name,
        valueFrom
      })
    }
  })

  // 配置文件
  const configFileData = trimLastEmpty(formData.config_files)
  _.map(configFileData, ({name, path}, idx) => {
    const configType = name.substring(name.lastIndexOf('-')+1)

    const configName = `config-${idx}`
    output.spec.template.spec.containers[0].volumeMounts.push({
      mountPath: path,
      name: configName
    })
    if (configType === 'configmap') {
      output.spec.template.spec.volumes.push({
        name: configName,
        configMap: { name: name.substring(0, name.lastIndexOf('-')) }
      })
    } else if (configType === 'secret') {
      output.spec.template.spec.volumes.push({
        name: configName,
        secret: { secretName: name.substring(0, name.lastIndexOf('-')) }
      })
    }
  })

  // mount volume
  const mountVolumesData = trimLastEmpty(formData.mount_volumes)
  _.map(mountVolumesData, ({volume, path}, idx) => {
    const name = `volume-${idx}`
    output.spec.template.spec.containers[0].volumeMounts.push({
      mountPath: path,
      name: name
    })
    output.spec.template.spec.volumes.push({
      name: name,
      persistentVolumeClaim: { claimName: volume }
    })
  })

  // healthCheck
  const type = formData.hcType
  if (type !== '无') {
    const healthCheck = _.cloneDeep(formData.health_check)
    if (type === 'HTTP / HTTPS') {
      healthCheck.httpGet.httpHeaders = _.clone(formData.hc_http_headers)
      healthCheck.httpGet.path = formData.hc_http_path
      healthCheck.httpGet.port = formData.hc_http_port
      delete healthCheck.tcpSocket
      delete healthCheck.exec
    } else if (type === 'TCP') {
      healthCheck.tcpSocket.port = formData.hc_tcp_port
      delete healthCheck.httpGet
      delete healthCheck.exec
    } else {
      healthCheck.exec.command = formData.hc_exec_command ? formData.hc_exec_command.split(/\s+/) : []
      delete healthCheck.httpGet
      delete healthCheck.tcpSocket
    }
    _.set(output, 'spec.template.spec.containers[0].livenessProbe', healthCheck)
  }

  return output
}

// 从formData获取创建Ingress的Json数据
const getIngressJsonArr = function (formData) {
  formData = _.cloneDeep(formData)
  const outputs = []
  const keyMap = {
    rewrite: 'metadata.annotations["nginx.ingress.kubernetes.io/rewrite-target"]',
    host: 'spec.rules.0.host',
    port: 'spec.rules.0.http.paths.0.backend.servicePort',
    url: 'spec.rules.0.http.paths.0.path'
  }

  const rules = trimLastEmpty(formData.external_slb_rules, ['controller'])
  _.forEach(rules, (item, idx) => {
    const output = _.cloneDeep(ingressTemplate)
    _.mapKeys(keyMap, (jsonKey, formKey) => {
      const value = _.get(item, formKey)
      if (value) {
        [].concat(jsonKey).map(key => {
          _.set(output, key, value)
        })
      }
    })
    _.set(output, 'metadata.name', `${formData.name}-${idx}`) 
    _.set(output, 'spec.rules.0.http.paths.0.backend.serviceName', formData.name) 
    outputs.push(output)
  })
  return outputs
}


// 从formData获取创建内部负载均衡的Json数据
const getServiceJson = function (formData) {
  formData = _.cloneDeep(formData)
  const output = _.cloneDeep(ServiceTemplate)
  const keyMap = {
    name: [
      'metadata.name',
      'metadata.labels.app',
      'spec.selector.app',
      'metadata.ownerReferences.0.name'
    ],
    namespace: 'metadata.namespace'
  }

  _.mapKeys(keyMap, (jsonKey, formKey) => {
    const value = _.get(formData, formKey)
    if (value) {
      [].concat(jsonKey).map(key => {
        _.set(output, key, value)
      })
    }
  })

  // ports
  output.spec.ports = _.cloneDeep(formData.port_pars);
  _.forEach(output.spec.ports, item => {
    item.name = formData.name + '-' + item.containerPort
    item.port = item.containerPort
    item.targetPort = item.containerPort
    delete item.containerPort
  })

  return output
}

const getFormDataFromJson = function (info, configs) {
  info = _.cloneDeep(info)
  const output = {
    resources: [],
    env_pars: []
  }
  const keyMap = {
    name: 'metadata.name',
    type: 'kind',
    desc: 'metadata.annotations["comment.jd.com"]',
    user: 'metadata.labels["user/jd.com"]',
    namespace: 'metadata.namespace',
    replicas: 'spec.replicas',
    port_pars: 'spec.template.spec.containers.0.ports',
    config_files: 'spec.template.spec.containers.0.volumes',
    dispatch_pars: 'spec.template.spec.containers.0.volumes',
  }
  _.mapKeys(keyMap, (jsonKey, formKey) => {
    const value = _.get(info, jsonKey)
    if (value) {
      _.set(output, formKey, value)
    }
  })

  // 表单校验时必须有初始化，不能为空
  output.port_pars = output.port_pars || []
  output.config_files = output.config_files || []
  output.dispatch_pars = output.dispatch_pars || []

  // node dispatch
  output.node_dispatch = false
  
  // resource
  let cpu = _.get(info, 'spec.template.spec.containers.0.resources.requests.cpu')
  if (_.includes(cpu, 'm')) {
    output.resources[0] = cpu.replace(/[^\d\.]/g, '') / 1000 + ''
  } else if(cpu) {
    output.resources[0] = cpu.replace(/[^\d\.]/g, '')
  }
  let memory = _.get(info, 'spec.template.spec.containers.0.resources.requests.memory')
  if (_.includes(memory, 'Gi')) {
    output.resources[1] = memory.replace(/[^\d\.]/g, '') * 1024 + 'Mi'
  } else {
    output.resources[1] = memory
  }

  // image
  const imageInfo = _.get(info, 'spec.template.spec.containers[0].image', '')
  // 镜像可能没有版本信息
  if (!_.includes(imageInfo, ':')) {
    output.image_name = imageInfo
    output.image_tag = ''
  } else {
    const m = imageInfo.match(/^(.*?):?([^:]*)$/)
    output.image_name = m[1]
    output.image_tag = m[2]
  }

  // 启动命令
  output.command = _.get(info, 'spec.template.spec.containers[0].command', []).join(' ')

  // 环境变量
  if (configs && configs.length > 0) {
    const env = _.get(info, 'spec.template.spec.containers[0].env', [])
    _.forEach(env, item => {
      if (_.has(item, 'valueFrom')) {
        let configName, config, key
        if (_.has(item, 'valueFrom.configMapKeyRef')) {
          configName = _.get(item, 'valueFrom.configMapKeyRef.name')
          key = _.get(item, 'valueFrom.configMapKeyRef.key')
          config = _.partition(configs, {id: `${configName}-configmap`})[0][0]
        } else {
          configName = _.get(item, 'valueFrom.secretKeyRef.name')
          key = _.get(item, 'valueFrom.secretKeyRef.key')
          config = _.partition(configs, {id: `${configName}-secret`})[0][0]
        }
        output.env_pars.push({
          name: item.name, value: config.data[key], config: _.merge(config, {key})
        })
      } else {
        output.env_pars.push({
          name: item.name, value: item.value, config: 'null'
        })
      }
    })
  }

  // 配置文件、pvc
  const volumeMounts = _.get(info, 'spec.template.spec.containers[0].volumeMounts', [])
  const volumes = _.get(info, 'spec.template.spec.volumes', [])
  output.mount_volumes = _.compact(_.map(volumes, item => {
    if (item.persistentVolumeClaim) {
      const volumeMount = _.head(_.partition(volumeMounts, {name: item.name}))[0]
      const path = volumeMount ? volumeMount.mountPath : ''
      return {
        volume: item.persistentVolumeClaim.claimName,
        path
      }
    }
  }))
  output.config_files = _.compact(_.map(volumes, item => {
    const volumeMount = _.head(_.partition(volumeMounts, {name: item.name}))[0]
    const path = volumeMount ? volumeMount.mountPath : ''
    if (item.configMap) {
      return {
        name: `${item.configMap.name}-configmap`,
        path
      }
    } else if (item.secret) {
      return {
        name: `${item.secret.secretName}-secret`,
        path
      }
    }
  }))

  // healthcheck
  output.hc_http_headers = []
  output.hc_http_port = null
  output.hc_http_path = null
  output.hc_tcp_port = null
  output.hc_exec_command = null
  output.health_check = {
    httpGet: {
      httpHeaders: [],
      scheme: 'HTTP',
      host: null,
      port: null,
      path: null
    },
    exec: {
      command: null
    },
    tcpSocket: {
      port: null
    },
    initialDelaySeconds: 15,
    timeoutSeconds: 1,
    periodSeconds: 10,
    successThreshold: 1,
    failureThreshold: 3
  }
  const hc = _.get(info, 'spec.template.spec.containers[0].livenessProbe', '')
  if (hc.exec) {
    hc.exec.command = _.concat(hc.exec.command).join(' ')
  }
  if (hc) {
    if (hc.httpGet) {
      output.hcType = 'HTTP / HTTPS'
      output.hc_http_headers = hc.httpGet.httpHeaders || []
      output.hc_http_port = hc.httpGet.port
      output.hc_http_path = hc.httpGet.path
    } else if (hc.tcpSocket) {
      output.hcType = 'TCP'
      output.hc_tcp_port = hc.tcpSocket.port
    } else {
      output.hcType = 'COMMAND'
      output.hc_exec_command = hc.exec.command
    }
    _.merge(output.health_check, hc)
  } else {
    output.hcType = '无'
  }

  return output
}


export {
  getFormDataFromJson,
  getAppJson,
  getIngressJsonArr,
  getServiceJson
}





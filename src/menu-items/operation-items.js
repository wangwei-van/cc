'use strict'

/*
 ** 后台管理门户导航菜单
 */

module.exports = [
  {
    iconType: 'ios-keypad',
    name: 'cluster',
    title: '集群',
    children: [
      {iconClass: 'dot', name: 'cluster-node', title: '节点管理'},
      {iconClass: 'dot', name: 'cluster-volume', title: '储存池管理'},
      {iconClass: 'dot', name: 'cluster-workload', title: '工作负载'},
      {iconClass: 'dot', name: 'cluster-loadbalance', title: '负载均衡'},
    ]
  },
  {
    iconType: 'ios-bookmarks',
    name: 'log',
    title: '日志',
  },
  {
    iconType: 'stats-bars',
    name: 'monitor',
    title: '监控',
  },
  {
    iconType: 'ios-bell',
    name: 'alarm',
    title: '告警',
  },
  {
    iconType: 'ios-color-filter',
    name: 'namespace',
    title: '项目',
    children: [
      {iconClass: 'dot', name: 'namespace-list', title: '空间管理'},
      {iconClass: 'dot', name: 'namespace-resource', title: '资源请求'},
    ]
  },
  {
    iconType: 'ios-people',
    name: 'account',
    title: '账户',
    children: [
      {iconClass: 'dot', name: 'account-user', title: '用户管理'},
    ]
  },
]
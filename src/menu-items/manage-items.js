'use strict'

/*
 ** 自服务门户导航菜单
 */

module.exports = [
  {iconType: 'earth', name: 'overview', title: '概况'},
  {
    iconType: 'cube',
    name: 'deploy',
    title: '应用',
    children: [
      {iconClass: 'dot', name: 'deploy-deployment-list', title: '应用管理'},
      {iconClass: 'dot', name: 'deploy-volume-list', title: '存储管理'},
      {iconClass: 'dot', name: 'deploy-config-list', title: '配置管理'}
      // {iconClass: 'dot', name: 'deploy-ingress-list', title: '路由管理'}
    ]
  },
  {
    iconType: 'android-cloud',
    name: 'develop',
    title: '开发',
    children: [
      {iconClass: 'dot', mark: 'true', name: 'develop-pipeline-list', title: '流水线'},
      // {iconClass: 'dot', name: 'develop-build-list', title: '构建'},
      // {iconClass: 'dot', name: 'develop-compile-list', title: '编译'},
      // {iconClass: 'dot', name: 'develop-publish-list', title: '发布'}
    ]
  },
  {
    iconType: 'bag',
    name: 'market',
    title: '市场',
    children: [
      {iconClass: 'dot', mark: 'true', name: 'market-release-list', title: '软件仓库'},
      {iconClass: 'dot', name: 'market-image-list', title: '镜像仓库'}
    ]
  },
  {
    iconType: 'stats-bars',
    name: 'monitor',
    title: '监控',
    children: [
      // {iconClass: 'dot', name: 'monitor-host-list', title: '主机'},
      {iconClass: 'dot', name: 'monitor-app-list', title: '应用'}
    ]
  },
  {
    iconType: 'ios-bookmarks',
    name: 'log',
    title: '日志',
    children: [
      {iconClass: 'dot', name: 'log-audit-log-list', title: '审计日志'}
    ]
  },
  {
    iconType: 'ios-people',
    name: 'account',
    title: '账户',
    children: [
      {iconClass: 'dot', name: 'account-namespace-list', title: '我的空间'}
    ]
  },
]

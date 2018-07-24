/**
 * @说明: 自服务门户路由，路由命名规范，需结合nav-menu组件（二级导航菜单）中一级菜单的name
 *        nav-menu组件中openNames取值[this.$route.name.split('-')[0]]，activeNames取值this.$route.meta.menu || this.$route.name
 *        1.为保证跳转或刷新页面后，openNames正确，一级菜单(例如name为deploy)下的所有子路由名称
 *          必须以'firstMenuName-'开始（例如deploy-deployment-list）
 *        2.为保证跳转或刷新页面后，activeNames正确，二级菜单(例如name为deploy-deployment-list)下的所有子路由
 *          必须包含meta属性，并且meta.menu字段值为该二级菜单的name
 * @说明人: jrwangwei3
 * @时间: 2018/07/02
 */

import Vue from 'vue'
import Router from 'vue-router'
import MainFrame from '../pages/common/main-frame'

const Overview = () => import('../pages/overview/Overview')
const ClusterNamespace = () => import('../pages/common/ClusterNamespace')
const DeploymentListPage = () => import('../pages/deployment/DeploymentListPage')
const DeploymentInfoPage = () => import('../pages/deployment/info/DeploymentInfoPage')
const IngressListPage = () => import('../pages/ingress/IngressListPage')
const ConfigList = () => import('../pages/config/ConfigList')
const PodTerminal = () => import('../pages/deployment/info/PodTerminal')
const CreateDeployment = () => import('../pages/deployment/create/CreateDeployment')
const VolumeList = () => import('../pages/deployment/volume/VolumeList')
const VolumeInfoPage = () => import('../pages/deployment/volume/VolumeInfoPage')
const Cluster = () => import('../pages/common/Cluster')
const NamespaceList = () => import('../pages/account/Namespace')
const NamespaceInfo = () => import('../pages/account/namespace-info/NamespaceInfo')
const PipelineList = () => import('../pages/development/pipeline/PipelineList')
const PipelineInfo = () => import('../pages/development/pipeline/PipelineInfo')
const MonitorHostList = () => import('../pages/monitor/MonitorHostList')
const MonitorHost = () => import('../pages/monitor/MonitorHost')
const MonitorAppList = () => import('../pages/monitor/MonitorAppList')
const MonitorApp = () => import('../pages/monitor/MonitorApp')
const AuditLog = () => import('../pages/log/AuditLog')
const Packages = () => import('../pages/market/Packages')
const PackageInfo = () => import('../pages/market/PackageInfo')
const Image = () => import('../pages/market/Image')
const ReleaseList = () => import('../pages/market/ReleaseList')

Vue.use(Router);

export default new Router({
  mode: 'history',

  routes: [
    {
      path: '/',
      redirect: {
        name: 'main-frame'
      }
    },
    {
      path: '/manage/pod-terminal/:cluster/:namespace/:container/:pod/:windowMode',
      name: 'pod-terminal',
      props: true,
      component: PodTerminal,
    },
    {
      // 共用顶栏和侧边栏
      path: '/manage',
      name: 'main-frame',
      component: MainFrame,
      redirect: {
        name: 'overview'
      },
      children: [
        {
          // 添加前缀，避免和其他路由冲突
          path: 'cluster/:cluster',
          name: 'cluster',
          component: Cluster,
          props: true,
          children: [
            {
              path: 'namespace-list',
              name: 'account-namespace-list',
              component: NamespaceList,
              props: true
            },
            {
              path: 'namespace-info/:namespaceId',
              name: 'account-namespace-info',
              component: NamespaceInfo,
              meta: {
                menu: 'account-namespace-list'
              },
              props: true
            },
            // host monitor
            {
              path: 'monitor/host-list',
              name: 'monitor-host-list',
              component: MonitorHostList,
              props: true
            },
            {
              path: 'monitor/host/:host',
              name: 'monitor-host',
              component: MonitorHost,
              meta: {
                menu: 'monitor-host-list'
              },
              props: true
            },

          ],
        },
        {
          path: 'market/package-list',
          name: 'market-package',
          component: Packages,
          meta: {
            menu: 'market-release-list'
          }
        },
        {
          path: 'market/package/:repository/:name/:version',
          name: 'market-package-info',
          component: PackageInfo,
          props: true,
          meta: {
            menu: 'market-release-list'
          }
        },
        {
          path: 'cluster/:cluster/namespace/:namespace',
          name: 'ClusterNamespace',
          component: ClusterNamespace,
          props: true,
          children: [
            // overview
            {
              path: 'overview',
              name: 'overview',
              component: Overview,
              props: true
            },
            // namespace
            // application
            {
              path: 'deployment/list',
              name: 'deploy-deployment-list',
              component: DeploymentListPage,
              props: true
            },
            {
              path: 'deployment/create',
              name: 'deploy-deployment-create',
              component: CreateDeployment,
              meta: {
                menu: 'deploy-deployment-list'
              },
              props: true
            },
            {
              path: 'deployment/:deploymentName',
              name: 'deploy-deployment-info',
              component: DeploymentInfoPage,
              meta: {
                menu: 'deploy-deployment-list'
              },
              props: true
            },
            {
              path: 'volume/list',
              name: 'deploy-volume-list',
              component: VolumeList,
              props: true,
            },
            {
              path: 'volume/:volumeName',
              name: 'deploy-volume-info',
              component: VolumeInfoPage,
              props: true,
              meta: {
                menu: 'deploy-volume-list'
              }
            },
            // config
            {
              path: 'config/list',
              name: 'deploy-config-list',
              component: ConfigList,
              props: true
            },
            // ingress
            {
              path: 'ingress/list',
              name: 'deploy-ingress-list',
              component: IngressListPage,
              props: true
            },
            // app monitor
            {
              path: 'monitor/app-list',
              name: 'monitor-app-list',
              component: MonitorAppList,
              props: true
            },
            {
              path: 'monitor/app/:app',
              name: 'monitor-app',
              component: MonitorApp,
              meta: {
                menu: 'monitor-app-list'
              },
              props: true
            },
            // audit log
            {
              path: 'log/audit-log',
              name: 'log-audit-log-list',
              component: AuditLog,
              props: true
            },
            // pipeline
            {
              path: 'pipeline-list',
              name: 'develop-pipeline-list',
              component: PipelineList,
              props: true
            },
            {
              path: 'pipeline-list/:pipeline',
              name: 'pipeline-info',
              component: PipelineInfo,
              meta: {
                menu: 'pipeline-list'
              },
              props: true
            },
            {
              path: 'build-list',
              name: 'develop-build-list',
              component: PipelineList,
              props: true
            },
            {
              path: 'compile-list',
              name: 'develop-compile-list',
              component: PipelineList,
              props: true
            },
            {
              path: 'publish-list',
              name: 'develop-publish-list',
              component: PipelineList,
              props: true
            },
            {
              path: 'image-list',
              name: 'market-image-list',
              component: Image,
              props: true
            },
            {
              path: 'market-release-list',
              name: 'market-release-list',
              component: ReleaseList,
              props: true
            }
          ]
        },
      ]
    },
    {
      path: '*', redirect: '/'
    }
  ]
})

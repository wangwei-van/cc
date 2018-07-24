import Vue from 'vue'
import Router from 'vue-router'
import MainFrame from '../pages/common/main-frame'

const Cluster = () => import('../pages/common/Cluster')
const NamespaceManage = () => import('../pages/Namespace/NamespaceManage')
const NamespaceInfo = () => import('../pages/Namespace/NamespaceInfo')
const User = () => import('../pages/account/User')

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
      // 共用顶栏和侧边栏
      path: '/operation',
      name: 'main-frame',
      component: MainFrame,
      redirect: {
        name: 'namespace-list'
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
              name: 'namespace-list',
              component: NamespaceManage,
              props: true
            },
            {
              path: 'namespace-info/:namespaceId',
              name: 'namespace-info',
              component: NamespaceInfo,
              meta: {
                menu: 'namespace-list'
              },
              props: true
            },
          ],
        },
        {
          path: 'user',
          name: 'account-user',
          component: User
        },
      ]
    },
    {
      path: '*', redirect: '/'
    }
  ]
})

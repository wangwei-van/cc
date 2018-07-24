// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import iView from 'iview'
import VueClipboards from 'vue-clipboards'
import App from './App'
import router from './router'
import store from './store'
import PortalVue from 'portal-vue'
import Public from './public'

// style
import './style/fin_design_theme/index.less'
import './style/settings-table.less'
import './style/common.less'
import 'xterm/dist/xterm.css'

Vue.config.productionTip = false

Vue.use(iView)
Vue.use(VueClipboards)
Vue.use(PortalVue)
Vue.use(Public)

// 修改iview的notice默认配置
Vue.prototype.$Notice.config({
  top: 50,
  duration: 3
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

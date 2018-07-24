import api from './api'
import BaseCollapse from './components/BaseCollapse'
import InputButton from './components/InputButton'
import YamlEditor from './components/YamlEditor'
import DataTableServer from './components/DataTableServer'
import DataTable from './components/DataTable'
import TableDropdown from './components/TableDropdown'
import FormDialog from './components/FormDialog'
import LineChart from './components/LineChart'
import DropdownSelect from './components/DropdownSelect'
import ButtonRadioGroup from './components/ButtonRadioGroup'
import {round} from './utils/filters'
import {modelDebounce, backTo} from './utils/custom-directives'
import _ from 'lodash'

export default {
  install (Vue, options) {
    // 注册api接口
    Vue.prototype.$api = api

    // 注册组件
    const registerComponent = {
      BaseCollapse,
      InputButton,
      DataTableServer,
      DataTable,
      TableDropdown,
      FormDialog,
      YamlEditor,
      LineChart,
      DropdownSelect,
      ButtonRadioGroup,
    }
    for (const name in registerComponent) {
      if (registerComponent.hasOwnProperty(name)) {
        Vue.component(name, registerComponent[name])
      }
    }

    // 注册全局方法
    /**
    * ajax 错误提示
     * @param error axios error obj
    * @param defaultMessage 默认消息格式，如果返回缺少message
    */
    Vue.prototype.$NoticeAjaxError = function (error, defaultMessage = '请求错误') {
      let s = _.get(error, 'response.data.message')
      s = _.isString(s) && s.length > 0 ? s : defaultMessage
      this.$Notice.error({title: s})
    }

    // 注册全局指令
    Vue.directive('model-debounce', modelDebounce)
    Vue.directive('back-to', backTo)

    // 注册全局过滤器
    Vue.filter('round', round)
  }
}

import _ from 'lodash'
import {scrollTop} from 'iview/src/utils/assist'


const modelDebounce = {
  // todo: bind value

  bind (el, binding, vnode) {
    let delay = parseInt(binding.arg)
    delay = delay ? delay : 300
    if (vnode.componentInstance) {
      vnode.componentInstance.$on('input', _.debounce(function (newVal) {
        vnode.context[binding.expression] = newVal
      }, delay))
    } else {
      vnode.elm.addEventListener('input', _.debounce(function (event) {
        vnode.context[binding.expression] = vnode.elm.value
      }, delay))
    }
  }
}

/*
 * @说明：滚动到顶部v-back-to:up，滚动到底部v-back-to:down
 *        添加parent修饰符时，滚动事件绑定在.main-content元素上，否则绑定在el
 * @说明人：jrwangwei3
 * @时间：2018/07/03
 */

const backTo = {
  inserted (el, binding, vnode) {
    const elm = document.createElement('div')
    const height = binding.value || 200

    const direction = binding.arg || 'up'
    if (direction === 'up') {
      elm.innerHTML = '<i class="ivu-icon ivu-icon-chevron-up"></i>'
      elm.setAttribute('class', 'back-to back-top-btn')
    } else if (direction === 'down') {
      elm.innerHTML = '<i class="ivu-icon ivu-icon-chevron-down"></i>'
      elm.setAttribute('class', 'back-to back-bottom-btn')
    }
    const bindTarget = binding.modifiers.parent ? document.querySelector('.main-content') : el
    if (binding.modifiers.parent) {
      document.body.appendChild(elm)
    } else {
      el.parentElement.appendChild(elm)
    }

    elm.onclick = function () {
      if (direction === 'up') {
        scrollTop(bindTarget, bindTarget.scrollTop, 0)
      } else {
        scrollTop(bindTarget, bindTarget.scrollTop, bindTarget.scrollHeight)
      }
    }
    let isShow = false

    bindTarget.addEventListener('scroll', (event) => {
      if (direction === 'up') {
        if (event.target.scrollTop > height && !isShow) {
          isShow = true
          elm.setAttribute('style', 'display: block;')
        } else if (event.target.scrollTop <= height && isShow) {
          isShow = false
          elm.setAttribute('style', 'display: none;')
        }
      } else if (direction === 'down') {
        if (event.target.scrollTop + event.target.offsetHeight < event.target.scrollHeight - height && !isShow) {
          isShow = true
          elm.setAttribute('style', 'display: block;')
        } else if (event.target.scrollTop + event.target.offsetHeight >= event.target.scrollHeight - height && isShow) {
          isShow = false
          elm.setAttribute('style', 'display: none;')
        }
      }
    })
  },
  unbind (el, binding, vnode) {
    _.forEach(document.querySelectorAll('.back-to'), item => {
      item.parentNode.removeChild(item)
    })
  }
}

export {
  modelDebounce,
  backTo
}

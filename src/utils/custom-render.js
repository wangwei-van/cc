import {COLORS} from '@/pars'
import _ from 'lodash'

const TagList = function (key, colorMap) {
  const getColor = tag => {
    if (colorMap && colorMap[tag] && COLORS[colorMap[tag]]) {
      return COLORS[colorMap[tag]]
    }
    return 'default'
  }

  return function (h, params) {
    let tagList = params.row[key]
    tagList = tagList ? tagList : []
    return tagList.map(tag => h(
      'Tag',
      {
        props: {
          color: getColor(tag)
        }
      },
      tag
    )
    )
  }
}

const TruncateComment = function (h, content, maxLen=20) {
  if (content && content.length > maxLen) {
    return h(
      'Tooltip',
      {
        props: {content: content}
      },
      [
        _.truncate(content, {length: maxLen}),
        h('div', {slot: 'content', style: {whiteSpace: 'normal'}}, content)
      ]
    )
  } else {
    return h('span', content)
  }
}

const StatusTagFactory = function (key, colorMap, labelMap) {
  /**
   * @param key: status的row key
   * @param colorMap: 值-色对应表, {1: 'success', 0: 'error', ...}
   * @param labelMap: optional, 值-显示内容表, {0: '错误', 1: 'xx'...}
   * @returns iview table column render, function (h, params) {...}
   */

  const getColor = val => {
    if (colorMap && colorMap[val] && COLORS[colorMap[val]]) {
      return COLORS[colorMap[val]]
    }
    return 'default'
  }

  return function (h, params) {
    const val = params.row[key]
    const label = labelMap ? labelMap[val] : val
    return[
      h('Icon', {props: {type: 'android-radio-button-on', color: getColor(val)}}),
      h('span', {style: {marginLeft: '5px'}}, label)
    ]
  }
}

export {
  TagList,
  TruncateComment,
  StatusTagFactory
}

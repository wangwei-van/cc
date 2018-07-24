import _ from 'lodash'

export const getCommentFromYaml = function (yaml) {
  const output = {}
  const lines = yaml.split('\n')
  let keyStack = ['top'],
      spaceStack = [0],
      comments = []
  const keyPatt = /^( *)([^-#:]+):/
  const commentPatt = /^ *#(.+)/
  const listPatt = /^( *)-$/
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // key
    const keyMatch = line.match(keyPatt)
    if (keyMatch) {
      const [space, key] = keyMatch.slice(1, 3)
      if (space.length > _.last(spaceStack)) {
        spaceStack.push(space.length)
        keyStack.push(key)
      } else if (space.length === _.last(spaceStack)) {
        keyStack.splice(-1, 1, key)
      } else {
        spaceStack = _.takeWhile(spaceStack, (value, key) => value < space.length)
        spaceStack.push(space.length)
        keyStack = keyStack.slice(0, spaceStack.length - 1).concat(key)
      }
      // 如果有备注，则写入备注
      if (comments.length > 0) {
        _.set(output, [keyStack.join('.')], comments)
        comments = []
      }
      continue
    }
    // comment
    const commentMatch = line.match(commentPatt)
    if (commentMatch) {
      comments.push(commentMatch[1])
      continue
    }
    // list
    const listMatch = line.match(listPatt)
    if (listMatch) {
      const space = keyMatch[1]
      spaceStack = _.takeWhile(spaceStack, (value, key) => value <= space.length)
      keyStack = keyStack.slice(0, spaceStack.length)
      if (space.length > _.last(spaceStack)) {
        spaceStack.push(space.length)
        keyStack.push(0)
      } else if (space.length === _.last(spaceStack)) {
        if (_.isNumber(_.last(keyStack))) {
          keyStack.splice(-1, 1, _.last(keyStack) + 1)
        }
      }
      continue
    }
    comments = []
  }
  return output
}

















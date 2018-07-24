// import _ from 'lodash'
const _ = require('lodash')

class A {
  constructor () {
    this.x = 1
  }
  func_2: 3

  func_1 () {
    return 1
  }
}


const a = new A()

const b = _.merge({}, a)

console.log(b.func_2, b.x)





const config = require('../config')

let items
if (config.system === 'manage') {
  items = require('./manage-items')
} else {
  items = require('./operation-items')
}
module.exports = items
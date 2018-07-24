const config = require('../config')

let router
if (config.system === 'manage') {
  router = require('./manage-router')
} else {
  router = require('./operation-router')
}
export default router.default

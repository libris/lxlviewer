'use strict'
const apiConf = require('./api_config.json')
const packageJson = require('../package.json')

module.exports = {
  NODE_ENV: '"production"',
  API_PATH: JSON.stringify(apiConf.path),
  AUTH_PATH: JSON.stringify(apiConf.auth),
  VERSION: JSON.stringify(packageJson.version)
}

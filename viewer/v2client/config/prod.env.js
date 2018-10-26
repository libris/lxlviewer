'use strict'
const apiConf = require('./api_config.json')
const packageJson = require('../package.json')

module.exports = {
  NODE_ENV: '"production"',
  PIWIK_ID: JSON.stringify(apiConf.piwik_id),
  DATA_PATH: apiConf.data ? JSON.stringify(apiConf.data) : JSON.stringify(apiConf.path),
  API_PATH: JSON.stringify(apiConf.path),
  AUTH_PATH: JSON.stringify(apiConf.auth),
  ID_PATH: JSON.stringify(apiConf.id),
  VERSION: JSON.stringify(packageJson.version)
}

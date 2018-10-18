'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')
const packageJson = require('../package.json')
const apiConf = require('./api_config.json')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  PIWIK_ID: JSON.stringify(apiConf.piwik_id),
  DATA_PATH: apiConf.data ? JSON.stringify(apiConf.data) : JSON.stringify(apiConf.path),
  API_PATH: JSON.stringify(apiConf.path),
  AUTH_PATH: JSON.stringify(apiConf.auth),
  ID_PATH: JSON.stringify(apiConf.id),
  VERSION: JSON.stringify(packageJson.version)
})

'use strict'
const apiConf = require('./api_config.json')

module.exports = {
  NODE_ENV: '"production"',
  API_PATH: JSON.stringify(apiConf.path)
}

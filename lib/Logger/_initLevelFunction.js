'use strict'

const _ = require('lodash')
const moment = require('moment')
const log4js = require('log4js')

/**
  * 初始化不同level的logger, 以日期为单位打印日志
  */
module.exports = function () {
  _.forEach([
    'trace',
    'info',
    'error',
    'fatal',
  ], level => {
    this[level] = (logKey, content) => {
      if (!logKey || !logKey.key) {
        throw new Error('LogKey was required!')
      }
      let logDateKey = logKey.key + '/' + moment().format('YYYY-MM-DD')
      if (['error', 'fatal'].includes(level)) {
        logDateKey += '.error'
      }
      let loggerCache = this._loggerCacheMap[logDateKey]
      if (!loggerCache) {
        loggerCache = this._loggerCacheMap[logDateKey] = log4js.getLogger(logDateKey)
      }
      loggerCache[level](content)
    }
  })
}

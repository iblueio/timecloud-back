'use strict'
const _ = require('lodash')
const log4js = require('log4js')
const path = require('path')
const moment = require('moment')

class Logger {

  /**
   * 使用log4js的默认Logger
   * 
   * @param {object} config
   * @param {string} config.directory
   * @param {object} config.log4js            optional
   * @param {bool  } config.autoClean
   * @param {string} config.autoCleanInterval
   */
  constructor(config) {
    /**
     * 
     * logDateKey is xxx/2018-05-10
     * 
     * {
     *   'logDateKey/2018-05-10' : {
     *     logger: log4js,
     *     lastModifiedTime: moment()
     *   }
     * }
     */
    this.loggerCacheMap = {}
    if (!config.log4js && !config.directory) {
      throw new Error('Log directory is missing')
    }
    log4js.configure(config.log4js || {
      appenders: {
        local: {
          type: 'multiFile',
          base: path.resolve(config.directory),
          property: 'categoryName',
          extension: '.log',
        }
      },
      categories: {
        default: {
          appenders: ['local'], level: 'trace',
        },
        local: {
          appenders: ['local'], level: 'trace',
        }
      }
    })
    this._initLevelFunction()
  }

  /**
   * 清除Logger的Cache
   */
  _cleanLoggerCache() {
    this.loggerCacheMap = {}
  }

  /**
   * 初始化不同level的logger, 已日期为单位打印日志
   */
  _initLevelFunction() {
    _.forEach([
      'trace',
      'info',
      'error',
      'fatal',
    ], level => {
      this[level] = (logKey, content) => {
        if (!logKey) {
          throw new Error('LogKey was required!')
        }
        let logDateKey = logKey + '/' + moment().format('YYYY-MM-DD')
        if (['error', 'fatal'].includes(level)) {
          logDateKey += '.error'
        }
        let loggerCache = this.loggerCacheMap[logDateKey]
        if (!loggerCache) {
          loggerCache = this.loggerCacheMap[logDateKey] = log4js.getLogger(logDateKey)
        }
        loggerCache[level](content)
      }
    })
  }
}

'use strict'
const log4js = require('log4js')
const path = require('path')
const mkdirp = require('mkdirp')

class Logger {

  /**
   * 使用log4js的默认Logger
   * 
   * @param {object} config
   * @param {string} config.directory
   * @param {object} config.log4js            optional
   * @param {number} config.autoCleanInterval optional (ms)
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
    this._loggerCacheMap = {}
    if (!config.log4js && !config.directory) {
      // TODO：自定义的log4js
      throw new Error('Log directory is missing')
    }
    mkdirp.sync(path.resolve(config.directory))
    log4js.configure(config.log4js || {
      pm2: true,
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
    setInterval(() => {
      this._cleanLoggerCache()
    }, config.autoCleanInterval || 1 * 24 * 60 * 60 * 1000)
  }

}

Logger.prototype._initLevelFunction = require('./_initLevelFunction')
Logger.prototype._cleanLoggerCache = require('./_cleanLoggerCache')

module.exports = Logger

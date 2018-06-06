'use strict'
/**
 * Timecloud-back
 */

const Core = require('timecloud-core')
const Processor = require('../Processor')
const Scanner = require('../Scanner')
const Logger = require('../Logger')
const debug = require('debug')('timecloud:back')

class Back {
  /**
   * 
   * @param {object  } config
   * @param {object  } config.db
   * @param {string  } config.db.address
   * @param {number  } config.scanInterval optional, default is 20 seconds
   * @param {string  } config.workDirectory
   * @param {string  } config.configName
   * @param {function} config.configParser optional
   * @param {string  } config.logDirectory
   * @param {object  } config.log4js optional
   * @param {number  } config.autoCleanInterval optional (ms) 
   */
  constructor(config, callback) {
    this._core = null
    this._logger = null
    this._scanner = null

    this._scanInterval = config.scanInterval || 20 * 1000
    this._intervalHandler = null

    this._logger = new Logger({
      directory: config.logDirectory,
      log4js: config.log4js,
      autoCleanInterval: config.autoCleanInterval,
    })

    this._scanner = new Scanner({
      workDirectory: config.workDirectory,
      configName: config.configName,
      configParser: config.configParser,
    }, this._logger)

    this._core = new Core({
      db: config.db
    }, (err, db) => {
      if (err) {
        callback(err, null)
        throw err
      }
      callback(null, db)
    })

  }

  getCore() {
    return this._core
  }

  async start() {
    await this._scanner.scanAndCreateProcessors(this._core)
    await this._core.start()
    this._intervalHandler = setTimeout(() => {
      this._scanner.scanAndCreateProcessors(this._core)
    }, this._scanInterval)
  }

  async stop() {
    await this._scanner.abortProcessors()
    await this._core.stop()
  }

}

module.exports = Back

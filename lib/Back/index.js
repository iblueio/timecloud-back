'use strict'
/**
 * Timecloud-back
 */

const Core = require('timecloud-core')
const Scanner = require('../Scanner')
const Logger = require('../Logger')
const debug = require('debug')('timecloud:back')
const EventEmitter = require('events').EventEmitter
const path = require('path')
const async = require('async')

class Back extends EventEmitter{
  constructor(config, cb) {
    super()
    if (!(this instanceof Back)) {
      return new Back(config)
    }

    config = config || {}

    this._scanInterval = config.scanInterval || 20 * 1000
    
    // 依次初始化 Logger Core Scanner
    async.waterfall([
    (next) => {
      this._logger = new Logger(config.log, next)
    },
    (next) => {
      this._core = new Core(config.core, next)
    },
    (collection, next) => {
      this._scanner = new Scanner({
        workDirectory: path.resolve(config.workDirectory) || path.resolve(process.env.HOME, 'timecloudJobs'),
        configName: config.configName || 'timecloud.json',
        core: this._core,
        logger: this._logger,
      }, next)
    },
    ], cb)
  }

  start() {
    debug('Back.start() is called')
    setInterval(() => {
      this._scanner.scan()
    }, this._scanInterval)
  }

}

mocha.exports = Back

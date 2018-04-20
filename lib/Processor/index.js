'use strict'
const debug = require('debug')('timecloud:Processor')

class Processor {

  /**
   * 
   * @param {object} config
   * @param {string} config.name
   * @param {string} config.directory
   * @param {string} config.script
   * @param {string} config.schedule
   * @param {number} config.retries   optional, default is 1
   * @param {number} config.timeout   optional, default is 10 mins
   * @param {object} config.env       optional, default is {}
   * @param {number} config.killDelay optional, default is 500ms
   * @param {module.Logger} logger
   */
  constructor(config, logger) {
    if (!logger) {
      throw new Error('Processor needs a logger')
    }

    this._name = config.name
    this._directory = config.directory
    this._script = config.script
    this._schedule = config.schedule
    this._retries = config.retries === undefined ? 1 : config.retries
    this._timeout = config.timeout || 10 * 60 * 1000
    this._env = config.env || {}

    this._logKey = { key: config.name }
    this._logger = logger

    this._process = null
    this._processTree = null
    this._processKillSignal = 'SIGUSR2'
    this._processKillDelay = config.killDelay || 500

  }
}

Processor.prototype._execute = require('./_execute')
Processor.prototype.isRunning = require('./isRunning')
Processor.prototype.run = require('./run')
Processor.prototype.abort = require('./abort')
Processor.prototype.setInterval = require('./setInterval')
Processor.prototype.clearInterval = require('./clearInterval')

module.exports = Processor

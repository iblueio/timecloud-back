'use strict'
const debug = require('debug')('timecloud:Processor')

class Processor {

  /**
   * 
   * @param {object} config
   * @param {string} config.name
   * @param {string} config.directory
   * @param {object} config.env
   * @param {string} config.script
   * @param {string} config.schedule
   * @param {number} config.retries
   * @param {number} config.timeout
   * @param {module.Core} core
   * @param {module.Logger} logger
   * @param {function} cb
   */
  constructor(config, core, logger, cb) {

    this._name = config.name
    this._directory = config.directory
    this._env = config.env || {}
    this._script = config.script
    this._retries = config.retries || 1
    this._timeout = config.timeout || 10 * 60 * 1000
    this._logKey = { key: config.name }

    this._core = core
    this._logger = logger

    this._process = null
    this._processTree = null

    // 定义任务，使用this.run()方法执行任务
    core.define(
      this._name,
      {
        concurrency: config.concurrency || 1,
        lockLimit: config.lockLimit || 0,
        lockLifetime: config.lockLifetime || 10 * 60 * 1000,
        priority: config.priority || 0,
      },
      (job, done) => {
        this.run().then(done).catch(done)
      }
    )

    // 将任务存储至MongoDB，并调用回调函数
    this._job = core.every(
      config.schedule,
      config.name,
      {},
      { timezone: 'Asia/Shanghai' },
      cb
    )
  }
}

Processor.prototype.isRunning = require('./isRunning')
Processor.prototype.execute = require('./execute')
Processor.prototype.run = require('./run')
Processor.prototype.abort = require('./abort')
Processor.prototype.remove = require('./remove')

module.exports = Processor

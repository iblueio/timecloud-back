'use strict'
const debug = require('debug')('timecloud:Scanner')
const path = require('path')

class Scanner {

  /**
   * 扫描器，会根据配置的路径和配置文件名去自动扫描任务的配置，并生成Processors
   * 
   * @param {object}    config 
   * @param {string}    config.workDirectory
   * @param {string}    config.configName
   * @param {function}  config.configParser optional
   */
  constructor(config, logger) {
    if (!logger) {
      throw new Error('Scanner needs a logger')
    }
    this._workDirectory = path.resolve(config.workDirectory) || path.resolve(process.env.HOME, 'timecloudJobs')
    this._configName = config.configName || 'timecloud.json'
    this._projectNameList = []
    this._jobConfigs = {}
    this._jobConfigsOld = {}
    this._processorMap = {}

    this._logKey = { key: 'timecloud:scanner' }
    this._logger = logger

    this._isWorking = false

    if (config.configParser) {
      if (config.configParser.constructor === Function) {
        this._configParser = config.configParser
      } else {
        throw new Error('configParser should be Function!')
      }
    }

  }
}

Scanner.prototype._defaultConfigParser = require('./_defaultConfigParser')
Scanner.prototype.readDirectory = require('./readDirectory')
Scanner.prototype.readConfigs = require('./readConfigs')
Scanner.prototype.parseConfig = require('./parseConfig')
Scanner.prototype.createProcessors = require('./createProcessors')
Scanner.prototype.clearProcessors = require('./clearProcessors')
Scanner.prototype.scanAndCreateProcessors = require('./scanAndCreateProcessors')
Scanner.prototype.abortProcessors = require('./abortProcessors')

module.exports = Scanner

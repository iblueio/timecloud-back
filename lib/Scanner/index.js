const Processor = require('../Processor')
const path = require('path')
const _ = require('lodash')
const fs = require('fs-extra')
const Promise = require('bluebird')
class Scanner {

  /**
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

  async scan() {
    if (this._isWorking) {
      return
    }
    this._isWorking = true
    await this.readDirectory()
    await this.readConfigs()
    this._isWorking = false
  }

  /**
   * 读取npm工作目录下的文件夹并保存到 this._package_dirs
   * 移除隐藏的文件夹
   * 
   * @returns {array }
   */
  async readDirectory() {
    let projectNameList = await fs.readdir(this._workDirectory)
    _.remove(projectNameList, projectName => {
      return projectName[0] === '.'
    })
    return this._projectNameList = projectNameList
  }


  /**
   * 扫描每个目录下的 package.json 和 timecloud.json
   * 在读取新一轮配置文件之前，会存储之前的旧配置
   * 这样能保证配置是能动态更新的
   * 
   * @returns {object}
   * 
   */
  async readConfigs() {
    let jobConfigsTemp = {}
    await Promise.map(this._projectNameList, async projectName => {
      try {
        let packageJSON = await fs.readFile(path.resolve(
          this._workDirectory,
          projectName,
          'package.json'
        ))
        let timecloudJSON = await fs.readFile(path.resolve(
          this._workDirectory,
          projectName,
          this._configName
        ))
        // 将配置拉平
        let projectConfigs = this.parseConfig(
          projectName,
          JSON.parse(packageJSON),
          JSON.parse(timecloudJSON)
        )
        for (let jobConfigs of projectConfigs) {
          jobConfigsTemp[jobConfigs.name] = jobConfigs
        }
      } catch (err) {
        this._logger.error(this._logKey, 'An error occurred while reading configs:', projectName, err)
        // 解析配置错误，命名为隐藏文件，否则每次扫描到都会一直报错
        // await fs.rename(
        //   path.resolve(this._workDirectory, projectName),
        //   path.resolve(this._workDirectory, '.' + projectName)
        // )
      }
    }, { concurrency: 5 })
    this._jobConfigsOld = _.cloneDeep(this._jobConfigs)
    return this._jobConfigs = jobConfigsTemp
  }

/**
 * 每次扫描目录后，对比新旧任务，删除或增加新任务到this.jobs
 * 
 * @param {module.Core} core
 * 
 * @returns {array } Jobs
 * 
 */
  async createProcessors(core) {
    if (!core) {
      throw new Error('Processor needs a core')
    }
    let toRemoveJobs = []
    let toCreateJobs = []
    let diffJobs = _.xor(_.keys(this._processorMap), _.keys(this._jobConfigs))
    for (let name of diffJobs) {
      this._jobConfigs[name] ? toCreateJobs.push(name) : toRemoveJobs.push(name)
    }
    // 创建定时任务
    let createdJobs = await Promise.map(toCreateJobs, async name => {
      let processor = new Processor(this._jobConfigs[name], this._logger)
      this._processorMap[name] = processor
      return processor.setInterval(core)
    })
    // 删除定时任务
    await Promise.map(toRemoveJobs, async name => {
      await this._processorMap[name].clearInterval()
    })
    return createdJobs
  }

  /**
   * 读取配置文件，并保存在内存中
   * 
   * @param {string} projectName
   * @param {object} packageJSON
   * @param {string} packageJSON.name
   * @param {string} packageJSON.version
   * @param {object} timecloudJSON
   * @param {array } timecloudJSON.jobs
   * @param {string} timecloudJSON.jobs[0].name
   * @param {string} timecloudJSON.jobs[0].script     
   * @param {string} timecloudJSON.jobs[0].schedule   
   * @param {number} timecloudJSON.jobs[0].retries    optional
   * @param {number} timecloudJSON.jobs[0].timeout    optional
   * @param {object} timecloudJSON.jobs[0].env        optional
   * @param {number} timecloudJSON.jobs[0].killDelay  optional
   * @returns {array}
   */
  parseConfig(projectName, packageJSON, timecloudJSON) {
    let configParser = this._configParser || this._defaultConfigParser
    return configParser.call(this, projectName, packageJSON, timecloudJSON)
    
  }

  _defaultConfigParser(projectName, packageJSON, timecloudJSON) {
    if (!timecloudJSON.jobs) {
      throw new Error('timecloud.json is wrong, jobs is missing.')
    }
    for (let jobConfig of timecloudJSON.jobs) {
      let missingFields = _.without(REQUIRED_CONFIGS, ..._.keys(jobConfig))
      if (missingFields.length) {
        throw new Error('Missing required fileds in timecloud.json: ' + missingFields.toString())
      }
    }
    let configList = []
    for (let jobConfig of timecloudJSON.jobs) {
      configList.push(_.defaults(
        {
          name: projectName + '@' + packageJSON.version + '-' + jobConfig.name,
          directory: path.resolve(this._workDirectory, projectName),
        },
        jobConfig
      ))
    }
    return configList
  }

}

module.exports = Scanner

const REQUIRED_CONFIGS = ['name', 'script', 'schedule']
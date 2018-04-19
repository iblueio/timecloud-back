const Processor = require('../Processor')
const path = require('path')
const _ = require('lodash')
const fs = require('fs-extra')
const Promise = require('bluebird')
class Scanner {

  /**
   * 
   * @param {object} config 
   * @param {string} config.workDirectory
   * @param {string} config.configName
   */
  constructor(config) {
    this._workDirectory = path.resolve(config.workDirectory) || path.resolve(process.env.HOME, 'timecloudJobs')
    this._configName = config.configName || 'timecloud.json'
    this._projectNameList = []
    this._projectConfigs = {}
    this._projectConfigsOld = {}

  }

  async scan() {

  }

  /**
   * 读取npm工作目录下的文件夹并保存到 this._package_dirs
   * 移除隐藏的文件夹
   */
  async readDirectory() {
    let projectNameList = await fs.readdir(this._workDirectory)
    _.remove(projectList, projectName => {
      return projectName[0] === '.'
    })
    this._projectNameList = projectNameList
  }


  /**
   * 扫描每个目录下的 package.json 和 timecloud.json
   * 在读取新一轮配置文件之前，会存储之前的旧配置
   * 这样能保证配置是能动态更新的
   */
  async readConfigs() {
    this._projectConfigsOld = _.cloneDeep(this._projectConfigs)
    let projectConfigsTemp = {}
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
        this._projectConfigs[projectName] = this.parseConfig(
          projectName,
          JSON.parse(packageJSON),
          JSON.parse(timecloudJSON)
        )
      } catch (err) {
        debug('An error occurred while reading configs:', projectName, err)
        // 解析配置错误，命名为隐藏文件，否则每次扫描到都会一直报错
        await fs.rename(
          path.resolve(this._workDirectory, projectName),
          path.resolve(this._workDirectory, '.' + projectName)
        )
      }
    }, {concurrency: 5})

  }

  /**
   * 读取配置文件，并保存在内存中
   */
  parseConfig(projectName, packageJSON, timecloudJSON) {

  }

}

module.exports = Scanner

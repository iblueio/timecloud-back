'use strict'
const Promise = require('bluebird')
const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')
/**
 * 扫描每个目录下的 package.json 和 timecloud.json
 * 在读取新一轮配置文件之前，会存储之前的旧配置
 * 这样能保证配置是能动态更新的
 * 
 * @returns {object}
 * 
 */
module.exports = async function () {
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
      await fs.rename(
        path.resolve(this._workDirectory, projectName),
        path.resolve(this._workDirectory, '.' + projectName)
      )
    }
  }, { concurrency: 5 })
  this._jobConfigsOld = _.cloneDeep(this._jobConfigs)
  return this._jobConfigs = jobConfigsTemp
}

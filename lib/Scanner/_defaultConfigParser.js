'use strict'
const _ = require('lodash')
const path = require('path')
const REQUIRED_CONFIGS = ['name', 'script', 'schedule']
/**
 * 读取配置文件的默认函数, 返回数组
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
module.exports = function (projectName, packageJSON, timecloudJSON) {
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

'use strict'
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
module.exports = function (projectName, packageJSON, timecloudJSON) {
  let configParser = this._configParser || this._defaultConfigParser
  return configParser.call(this, projectName, packageJSON, timecloudJSON)
}

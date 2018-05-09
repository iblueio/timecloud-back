'use strict'
/**
 * 依次扫描目录以及配置文件并生成Processors
 * 保证多次调用不会重复读取
 * @returns {array | undefined}
 */
module.exports = async function (core) {
  if (this._isWorking) {
    return
  }
  this._isWorking = true
  await this.readDirectory()
  await this.readConfigs()
  let createdJobs = await this.createProcessors(core)
  this._isWorking = false
  return createdJobs
}

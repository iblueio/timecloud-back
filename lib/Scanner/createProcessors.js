'use strict'
const Promise = require('bluebird')
const _ = require('lodash')
const Processor = require('../Processor')
/**
 * 每次扫描目录后，对比新旧任务，删除或增加新任务到this.jobs
 * 
 * @param {module.Core} core
 * @returns {array } Jobs
 * 
 */
module.exports = async function (core) {
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
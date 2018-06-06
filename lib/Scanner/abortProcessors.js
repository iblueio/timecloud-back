'use strict'
const Promise = require('bluebird')
const _ = require('lodash')

/**
 * 清除所有任务的定时（正在运行的不会受到影响）
 * 
 * @returns {undefined}
 */
module.exports = async function () {
  await Promise.map(_.keys(this._processorMap), async name => {
    // TODO: 检测退出状态
    await this._processorMap[name].abort()
  })
}

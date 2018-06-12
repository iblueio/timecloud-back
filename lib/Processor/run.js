'use strict'
const debug = require('debug')('timecloud:Processor')
const retry = require('promise-retry')

/**
 * 执行任务
 * 当任务出错或超时后会尝试停止任务进程
 * 如果停止任务进程成功，会重试任务
 * 如果无法停止任务进程会抛出错误，不再重试，直接判定当前任务失败
 * #TODO: 支持并发
 */
module.exports = async function () {
  if (this.isRunning()) {
    return
  }
  await retry(async (retry, number) => {
    this._logger.trace(this._logKey, `Job is running: ${this._name} ${number} times`)
    try {
      await this._execute().timeout(this._timeout)
    } catch (err) {
      this._logger.fatal(this._logKey, `Job is failed: ${this._name}\n${JSON.stringify(err)}`)
      await this.abort()
      retry(err)
    } finally {
      this._process = null
    }
  }, {
    retries: this._retries,
    factor: 1,
    minTimeout: 5000,
  })
}

'use strict'

/**
 * 从数据库中删除任务
 */
module.exports = async function () {
  await new Promise((res, rej) => this._job.remove(err => err ? rej(err) : res()))
}

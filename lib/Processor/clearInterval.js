'use strict'

/**
 * 从数据库中删除任务
 * 
 * @returns {undefined}
 */
module.exports = async function () {

  if (!this._job) {
    return
  }

  await new Promise((resolve, reject) => {
    this._job.remove(err => {
      if (err) reject(err)
      this._job = null
      resolve()
    })
  })

}

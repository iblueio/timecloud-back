/**
 * 将任务持久化存储并定时运行
 * 
 * @param {module.Core} core 
 * @param {object} options
 * @param {number} options.concurrency
 * @param {number} options.lockLimit
 * @param {number} options.lockLifetime
 * @param {number} options.priority
 * @returns {module.Job}
 */

module.exports = async function (core, options) {

  // 如果有任务了, 则先清除再设置
  if (this._job) {
    await this.clearInterval()
  }
  
  let _options = options || {}

  // 定义任务，使用this.run()方法执行任务
  core.define(
    this._name,
    {
      concurrency: _options.concurrency || 1,
      lockLimit: _options.lockLimit || 0,
      lockLifetime: _options.lockLifetime || 10 * 60 * 1000,
      priority: _options.priority || 0,
    },
    (job, done) => {
      this.run().then(done).catch(done)
    }
  )

  // 将任务存储至MongoDB，并调用回调函数
  return await new Promise((resolve, reject) => {
    this._job = core.every(
      this._schedule,
      this._name,
      {},
      { timezone: 'Asia/Shanghai' },
      (err, job) => err ? reject(err) : resolve(job)
    )
  })
  
}

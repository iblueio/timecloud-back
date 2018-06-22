'use strict'
const treeKill = require('tree-kill')
/**
 * 中断任务，扫描进程树并发送特定信号杀死进程
 */
module.exports = async function () {
  if (!this.isRunning()) {
    return
  }
  let pid = this._process.pid
  this._logger.trace(this._logKey, `Job is aborting: ${this._name} pid: ${pid}`)
  await new Promise(res => treeKill(pid, this._processKillSignal, res))
  this._process = null
}

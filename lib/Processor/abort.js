'use strict'
const debug = require('debug')('timecloud:Processor')

const utils = require('../utils')
/**
 * 中断任务，扫描进程树并发送特定信号杀死进程
 */
module.exports = async function () {
  if (!this.isRunning()) {
    return
  }
  let pid = this._process.pid
  debug('Job is aborting:', this._name, 'pid:', pid)
  this._processTree = new utils.ProcessTree(pid)
  await this._processTree.init()
  await this._processTree.sendSignal(this._processKillSignal)
  let remainPids = await this._processTree.checkAlive(this._processKillDelay)
  this._processTree = null
  if (remainPids.length) {
    throw new Error('Can not stop the process! Please handle it manually: ' + remainPids.toString())
  }
  debug('Job aborted:', this._name, 'pid:', pid)
}

'use strict'
const debug = require('debug')('timecloud:Processor')
const KILL_SIGNAL = 'SIGUSR2'
const KILL_DELAY = 5000

const utils = require('../utils')
/**
 * 中断任务，扫描进程树并发送特定信号杀死进程
 */
module.exports = async function () {
  if (!this.isRunning()) {
    return
  }
  debug('Job is aborting:', this._name, 'pid:', pid)
  let pid = this._process.pid
  this._processTree = new utils.ProcessTree(pid)
  await this._processTree.init()
  await this._processTree.sendSignal(KILL_SIGNAL)
  let remainPids = await this._processTree.checkAlive()
  this._processTree = null
  if (remainPids.length) {
    throw new Error('Can not stop the process! Please handle it manually: ' + remainPids.toString())
  }
  debug('Job aborted:', this._name, 'pid:', pid)
}

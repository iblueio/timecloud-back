'use strict'

const childProcess = require('child_process')
const Promise = require('bluebird')
const path = require('path')

/**
 * 执行脚本并返回ChildProcess实例，注册监听事件
 * 使用Bluebird是因为需要使用 promise.timeout() 方法防止超时
 */
module.exports = function () {
  return new Promise((resolve, reject) => {
    let [command, ...parameters] = this._script.split(' ')
    this._process = childProcess.spawn(command, parameters, {
      cwd: path.resolve(this._directory),
      env: this._env,
      detached: true,
    })
    this._process.on('error', reject)
    this._process.on('exit', (code, signal) => {
      switch (code) {
        case 0: resolve(); break
        case 1: reject(new Error('Job Failed, exit with code 1.')); break
        default: signal === KILL_SIGNAL ? resolve(signal) : reject(new Error('Unknown exit status'))
      }
    })
    this._process.stdout.on('data', data => {
      this._logger.info(data, this._logKey)
    })
    this._process.stderr.on('data', data => {
      this._logger.error(data, this._logKey)
    })
  })
}

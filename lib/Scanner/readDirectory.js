'use strict'
const _ = require('lodash')
const fs = require('fs-extra')
/**
 * 读取npm工作目录下的文件夹并保存到 this._package_dirs
 * 移除隐藏的文件夹
 * 
 * @returns {array }
 */
module.exports = async function () {
  let projectNameList = await fs.readdir(this._workDirectory)
  _.remove(projectNameList, projectName => {
    return projectName[0] === '.'
  })
  return this._projectNameList = projectNameList
}

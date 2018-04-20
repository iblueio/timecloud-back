'use strict'

module.exports = function () {
  return Boolean(this._process && this._process.pid || this._processTree)
}

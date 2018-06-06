const Logger = require('../lib/Logger')
const assert = require('assert')

describe('Logger', () => {

  let logger = new Logger({
    directory: './.tmp',
    autoCleanInterval: 1
  })

  it('缺少logKey报错', async () => {
    try {
      logger.info('wrong')
    } catch (err) {
      assert(err.message.match(/LogKey was required!/))
    }
  })

  it('正常输出日志', async () => {
    logger.info({key: 'log-test'}, 'test1')
    logger.info({key: 'log-test'}, 'test2')
    logger.info({key: 'log-test2'}, 'test2')
  })

  it('多级日志输出', async () => {
    logger.error({key: 'a/b/c/d/e'}, 'test')
  })

})

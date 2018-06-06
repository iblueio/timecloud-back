const Processor = require('../lib/Processor')
const Core = require('timecloud-core')
const path = require('path')
const sleep = require('sleep-promise')
const assert = require('assert')


const logger = {
  info:  console.log,
  error: console.log,
  debug: console.log,
  fatal: console.log,
}

describe('Processor', () => {

  let processor = new Processor({
    name: 'normal',
    directory: path.resolve(__dirname, 'test-packages', 'normal'),
    script: 'npm start',
    schedule: '*/5 * * * * *',
    retries: 0,
    timeout: 10000
  }, logger)

  it('run and abort', async () => {
    processor.run()
    await sleep(1000)
    assert(processor.isRunning())
    await processor.abort()
    assert(!processor.isRunning())
  })

  it('setInterval and clearInterval', async () => {
    let core
    await new Promise(res => {
      core = new Core({ db: { address: 'mongodb://localhost/iblueio' } }, res)
    })
    // 将job保存至数据库 这里无需调用core.start()运行定时任务
    let job = await processor.setInterval(core)
    assert.equal(job.attrs.name, 'normal')
    // 这里会将定时任务从数据库中删除
    await processor.clearInterval()
  })
})

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
    schedule: '*/3 * * * * *',
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
    let job = await processor.setInterval(core)
    assert.equal(job.attrs.name, 'normal')
    await processor.clearInterval()
  })

})

const Scanner = require('../lib/Scanner')
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

describe('Scanner', () => {

  let scanner = new Scanner({
    workDirectory: path.resolve(__dirname, 'test-packages'),
    configName: 'timecloud.json'
  }, logger)

  it('readDirectory', async () => {
    let projectNameList = await scanner.readDirectory()
    assert.equal(projectNameList[0], 'normal')
  })

  it('readConfigs', async () => {
    let jobConfigs = await scanner.readConfigs()
    assert(jobConfigs['normal@1.0.0-start'])
  })

  it('self-configParser', async () => {
    const configParser = function (projectName, packageJSON, timecloudJSON) {
      return [
        {
          name: projectName + '.ENV=prod@1.0.0-start',
          env: {ENV: 'prod'},
          script: 'npm start',
          schedule: '*/5 * * * * *',
        }
      ]
    }
    let scanner = new Scanner({
      workDirectory: path.resolve(__dirname, 'test-packages'),
      configName: 'timecloud.json',
      configParser: configParser,
    }, logger)
    await scanner.readDirectory()
    let jobConfigs = await scanner.readConfigs()
    assert(jobConfigs['normal.ENV=prod@1.0.0-start'])
  })

  it('createProcessors and clearProcessors', async () => {
    let core
    await new Promise(res => {
      core = new Core({ db: { address: 'mongodb://localhost/iblueio' } }, res)
    })
    await scanner.readDirectory()
    await scanner.readConfigs()
    let createdJobs = await scanner.createProcessors(core)
    assert(createdJobs[0].attrs.name.includes('normal'))
    await scanner.clearProcessors()
    assert(!Object.keys(scanner._processorMap).length)
  })

  it('scanAndCreateProcessors', async () => {
    let core
    await new Promise(res => {
      core = new Core({ db: { address: 'mongodb://localhost/iblueio' } }, res)
    })
    let createdJobs = await scanner.scanAndCreateProcessors(core)
    assert(createdJobs[0].attrs.name.includes('normal'))
    await scanner.clearProcessors()
    assert(!Object.keys(scanner._processorMap).length)
  })

})

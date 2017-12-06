/* global browser */

import * as webdriverio from 'webdriverio'
import path from 'path'
import mergeClientCoverage from './util/mergeClientCoverage'
import fs from 'fs-extra'
import requireEnv from '../../src/universal/util/requireEnv'
import superagent from './util/superagent'

const root = path.resolve(__dirname, '..', '..')
const errorShots = path.resolve(root, 'errorShots')

describe('selenium tests', function () {
  this.timeout(30000)

  before(async function () {
    try {
      global.browser = webdriverio.remote({
        desiredCapabilities: {
          browserName: 'chrome',
        },
        logLevel: process.env.WDIO_LOG_LEVEL || 'silent',
        baseUrl: requireEnv('ROOT_URL'),
      })
      await browser.init()
    } catch (error) {
      if (error.seleniumStack) throw new Error(error.seleniumStack.message)
      throw error
    }

    try {
      await superagent.get('/')
    } catch (error) {
      throw new Error(`Can't connect to webapp: ${error.message}`)
    }
  })
  beforeEach(function () {
    browser.timeouts('implicit', 1000)
  })
  after(async function () {
    if (browser) await browser.end()
  })

  afterEach(async function () {
    const {state, title} = this.currentTest
    if (state === 'failed') {
      await fs.mkdirs(errorShots)
      const screenshotFile = path.join(errorShots, `ERROR_phantomjs_${title.replace(/[^a-z0-9 ]/ig, '_')}_${new Date().toISOString()}.png`)
      await browser.saveScreenshot(screenshotFile)
      console.log('Saved screenshot to', screenshotFile) // eslint-disable-line no-console

      await fs.mkdirs(errorShots)
      const logFile = path.join(errorShots, `ERROR_phantomjs_${title.replace(/[^a-z0-9 ]/ig, '_')}_${new Date().toISOString()}.log`)
      const logs = (await browser.log('browser')).value
      await fs.writeFile(logFile, logs.map(({message}) => message).join('\n'), 'utf8')
    }

    await mergeClientCoverage()
  })

  require('./basicTests')
})


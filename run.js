#!/usr/bin/env node
// @flow

'use strict'

const glob = require('glob')
const path = require('path')
const {execSync} = require('child_process')
const touch = require('touch')
const fs = require('fs-extra')
const chalk = require('chalk')
const requireEnv = require('@jcoreio/require-env')
const promake = require('./scripts/promake')

process.chdir(__dirname)
const pathDelimiter = /^win/.test(process.platform) ? ';' : ':'
const npmBin = execSync(`npm bin`).toString('utf8').trim()
process.env.PATH = process.env.PATH ? `${npmBin}${pathDelimiter}${process.env.PATH}` : npmBin

const {TARGET} = process.env
const build = path.resolve(TARGET ? `build-${TARGET}` : 'build')
process.env.BUILD_DIR = build

const {rule, task, exec, spawn, envRule, cli} = promake

function remove(path /* : string */) /* : Promise<void> */ {
  console.error(chalk.gray('$'), chalk.gray('rm'), chalk.gray('-rf'), chalk.gray(path)) // eslint-disable-line no-console
  return fs.remove(path)
}

rule('node_modules', ['package.json', 'yarn.lock'], async () => {
  await exec('yarn --ignore-scripts')
  await touch('node_modules')
})

function env(...names /* : Array<string> */) /* : {[name: string]: ?string} */ {
  return {
    ...process.env,
    ...require('defaultenv')(names.map(name => `env/${name}.js`), {noExport: true}),
  }
}

const serverEnv = `${build}/.serverEnv`
const srcServer = glob.sync('src/server/**/*.js')
const buildServer = srcServer.map(file => file.replace(/^src/, build))
const serverPrerequisites = [
  ...srcServer,
  'node_modules',
  serverEnv,
  '.babelrc',
  'defines.js',
  ...glob.sync('src/server/**/.babelrc')
]

envRule(serverEnv, ['NODE_ENV', 'BABEL_ENV', 'CI'], {getEnv: async () => env('prod')})
rule(buildServer, serverPrerequisites, async () => {
  await remove(`${build}/server`)
  await spawn('babel', ['src/server', '--out-dir', `${build}/server`], {env: env('prod')})
})

const universalEnv = `${build}/.universalEnv`
const srcUniversal = glob.sync('src/universal/**/*.js')
const buildUniversal = srcUniversal.map(file => file.replace(/^src/, build))
const universalPrerequisites = [
  ...srcUniversal,
  universalEnv,
  'node_modules',
  '.babelrc',
  'defines.js',
  ...glob.sync('src/universal/**/.babelrc')
]

envRule(universalEnv, ['NODE_ENV', 'BABEL_ENV', 'CI'], {getEnv: async () => env('prod')})
rule(buildUniversal, universalPrerequisites, async () => {
  await remove(`${build}/universal`)
  await spawn(`babel`, ['src/universal', '--out-dir', `${build}/universal`], {env: env('prod')})
})
task(`build:universal`, buildUniversal).description('build code shared between client and server')

task('build:server', [...buildServer, ...buildUniversal]).description('build server code')

const clientEnv = `${build}/.clientEnv`
const srcClient = glob.sync('src/client/**/*.js')
const buildClient = [`${build}/assets.json`]
const clientPrerequisites = [
  ...srcUniversal,
  ...srcClient,
  ...glob.sync('src/client/**/.babelrc'),
  clientEnv,
  'node_modules',
  ...glob.sync('webpack/**/*.js'),
]

envRule(
  clientEnv,
  [
    'NODE_ENV', 'BABEL_ENV', 'CI', 'NO_UGLIFY', 'NO_HAPPYPACK', 'WEBPACK_DEVTOOL',
    'LOG_REDUX_ACTIONS',
  ],
  {getEnv: async () => env('prod')}
)
rule(buildClient, clientPrerequisites, async () => {
  await remove(`${build}/assets`)
  await spawn(`webpack`, ['--config', 'webpack/webpack.config.prod.js', '--colors'], {env: env('prod')})
})
task(`build:client`, buildClient).description('webpack client code')

task('build', [
  task('build:server'),
  task('build:client'),
]).description('build everything')

task('built', 'build', async () => {
  require('defaultenv')(['env/prod.js', 'env/local.js'])
  // $FlowFixMe
  await require(`${build}/server/index.js`).start()
  await new Promise(() => {})
}).description('run output of build')

task('clean', () => remove(build)).description('remove build output')

task('dev:server', ['node_modules'], async () => {
  require('defaultenv')(['env/dev.js', 'env/local.js'])
  require('babel-register')
  await require('./scripts/runServerWithHotRestarting')({
    srcDir: path.resolve('src'),
  })
  await new Promise(() => {})
}).description('launch backend in dev mode')

task('dev:client', ['node_modules'], async () => {
  require('defaultenv')(['env/dev.js', 'env/local.js'])
  require('babel-register')
  require('./scripts/devServer')
  await new Promise(() => {})
}).description('launch webpack dev server')

task('prod:server', ['node_modules', task('build:server')], async () => {
  require('defaultenv')(['env/prod.js', 'env/local.js'])
  spawn('babel', ['--skip-initial-build', '--watch', 'src/server', '--out-dir', `${build}/server`])
  spawn('babel', ['--skip-initial-build', '--watch', 'src/universal', '--out-dir', `${build}/universal`])
  require('babel-register')
  await require('./scripts/runServerWithHotRestarting')({
    srcDir: build,
  })
  await new Promise(() => {})
}).description('launch backend in prod mode')

task('prod:client', ['node_modules'], () =>
  spawn('webpack', ['--config', 'webpack/webpack.config.prod.js', '--watch', '--colors'], {env: env('prod')})
).description('launch webpack in prod mode')

cli()

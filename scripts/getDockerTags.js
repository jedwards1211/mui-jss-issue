// @flow
/* eslint-disable flowtype/require-return-type, flowtype/require-parameter-type */

const getCommitHash = require('./getCommitHash')

async function getDockerTags(env /* : {[name: string]: ?string} */ = process.env) /* : Promise<{latest: string, commitHash: string}> */ {
  const {TARGET} = env
  const commitHash = await getCommitHash()
  const base = `jedwards1211/mui-jss-issue${TARGET ? '-' + TARGET : ''}`
  return {
    latest: base,
    commitHash: `${base}:${commitHash}`,
  }
}

module.exports = getDockerTags



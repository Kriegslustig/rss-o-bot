/**
 * helpers
 * Helper functions used by multiple modules.
 */
const fs = require('fs')
const path = require('path')
const markedMan = require('marked-man')
const debug = require('debug')('rss-o-bot')

const locations = [
  `${__dirname}/../../data`,
  process.platform === 'win32'
    ? `${process.env.USERPROFILE}/.rss-o-bot`
    : `${process.env.HOME}/.rss-o-bot`
].map(l => path.normalize(l))

const configError = `No config file found!
RTFM and put one in one of these locations:
${locations.join(', ')}
`

const domainRegex = '([\\w\\d-]+\\.)+\\w{2,}'
const protoRegex = '\\w+:\\/\\/'
const defaults = {
  port: 3645,
  interval: 600,
  'jwt-expiration': 60,
  database: {
    name: 'rss-o-bot',
    options: {
      dialect: 'sqlite',
      storage: `${locations[1]}/feeds.sqlite`
    }
  }
}

const helpers = {
  getTime (mod = 0) {
    return Math.round(((new Date()).getTime()) / 1000) + mod
  },

  getConfig: (() => {
    const config =
      locations
        .filter(l => {
          try {
            return fs.statSync(l).isDirectory()
          } catch (e) {
            return false
          }
        })
        .slice(0, 1)
        .map(l =>
           debug(`Loading config ${l}`) ||
           [
             fs.readFileSync(path.normalize(`${l}/config.json`)),
             l
           ]
        )
        .map(([c, l]) => Object.assign(defaults, { location: l }, JSON.parse(c)))[0]
    return key => {
      if (!config) {
        throw new Error(configError)
      }
      return (
        key
          ? config[key]
          : config
      )
    }
  })(),

  transformFilter (filter) {
    return (
      filter[0] === '!'
        ? {keyword: filter.substr(1), kind: false}
        : {keyword: filter, kind: true}
    )
  },

  isAbsoluteUrl (str) {
    return !!str.match(new RegExp(`^${protoRegex}|${domainRegex}`))
  },

  getBaseUrl (url) {
    const match = url.match(new RegExp(`(${protoRegex})?${domainRegex}`))
    if (!match) return ''
    return match[0]
  },

  buildMan () {
    const packageInfo = require('../../package.json')
    const synopsis = fs.readFileSync(`${__dirname}/../../src/man/synopsis.md`).toString()
    const raw =
      fs.readFileSync(`${__dirname}/../../src/man/man.md`).toString()
        .replace('[[SYNOPSIS]]', synopsis)
        .replace('[[VERSION]]', packageInfo.version)
    const man = markedMan(raw, {
      version: packageInfo.version,
      section: 1
    })
    return { synopsis, man, raw }
  }
}

module.exports = helpers


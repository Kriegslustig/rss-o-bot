const { test } = require('ava')
const Config = require('../../../dist/lib/config')

test('validate empty', t => t.truthy(
  Config.validate({})
))

test('validate full', t => t.truthy(
  Config.validate({
    'name': 'rss-o-bot',
    'options': {
      'dialect': 'sqlite',
      'storage': '~/.rss-o-bot/feeds.sqlite'
    }
  })
))

test('validate extended', t => t.truthy(
  Config.validate({
    'name': 'rss-o-bot',
    'options': {
      'dialect': 'sqlite',
      'storage': '~/.rss-o-bot/feeds.sqlite'
    },
    'undefined': ''
  })
))


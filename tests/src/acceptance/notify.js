/* Mainly scenario tests for the notify module.
 * But it kindof flows into some tests for the pollFeeds module.
 */

const { test } = require('ava')
const { Observable: O } = require('rxjs/Rx')

const runCLI = require('../../../dist/cli.js')
const Poll = require('../../../dist/lib/shared/poll.js')
const T = require('../helpers/helpers')

T.mockLucaschmidNet()

const createDummyEntryAndPoll = (config, url, offset = 2) =>
  T.createDummyEntry(url, [], config, true)
    .switchMap(([store, feed]) =>
      Poll(url, [])
        .map(entries => entries.slice(0, offset))
        .switchMap(entries =>
          store.updateLatestLink(feed.get('id'), entries[offset - 1].link)
            .mapTo(entries.slice(0, -1))
        )
    )

test.cb('notifier injection', t => {
  const url = 'https://lucaschmid.net/feed/rss.xml'
  const config = T.getConfigWithDefaults({
    'notification-methods': [`${__dirname}/../helpers/notifier.js`]
  })
  global.NOTIFIER_TEST_OBJECT = t
  createDummyEntryAndPoll(config, url)
    .switchMap(() => runCLI(['node', '', 'poll-feeds'], null, config))
    .subscribe(
      () => {},
      T.handleError(t)
    )
})

test.cb('notifiers/poll-feeds order', t => {
  let latestItem
  const notify = config => (blog, link, title) => {
    t.is(link, latestItem.link)
    t.end()
    return O.of(true)
  }
  const url = 'https://lucaschmid.net/feed/rss.xml'
  const config = T.getConfigWithDefaults({
    'notification-methods': [notify]
  })
  createDummyEntryAndPoll(config, url)
    .do(([latest]) => { latestItem = latest })
    .switchMap(() => runCLI(['node', '', 'poll-feeds'], null, config))
    .subscribe(
      () => {},
      T.handleError(t)
    )
})

test.cb('poll-feeds multiple new posts', t => {
  let latestItems
  let i = 0
  const notify = config => (blog, link, title) => {
    t.is(link, latestItems[(i - 1) * -1].link)
    if (++i === 2) t.end()
    return O.of(true)
  }
  const url = 'https://lucaschmid.net/feed/rss.xml'
  const config = T.getConfigWithDefaults({
    'notification-methods': [notify]
  })
  createDummyEntryAndPoll(config, url, 3)
    .do(latest => { latestItems = latest })
    .switchMap(() => runCLI(['node', '', 'poll-feeds'], null, config))
    .subscribe(
      () => {},
      T.handleError(t)
    )
})


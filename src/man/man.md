# RSS-o-Bot

## Synopsis
[[SYNOPSIS]]

## Flags

### -h, --help
Displays the synopsis.

### -m, --man, --manual
Display the whole man page.

### -v, --version
Display the current version.

## Actions
### [run]
Run the deamon process in the foreground.

### add <url> [<filter>...]
Add a Feed-URL to the database. <url> is a URL to an Atom or RSS feed. The URL must include the protocol. HTTP and HTTPS are supported. Post-titles inside a feed will be filtered by the words passed as <filter>s to `add`. <filter> can be negated (to check that a title doesn't include a string) by pepending them with a bang (`!`). For example `rss-o-bot add <url> 'children' '!cooking'`. Be carefull to always wrap negated filters in quotes (`'`). Otherwise your shell will probably interpret the bang as a keyword.

### rm <id>
Remove a Feed-URL from the database. <id> is the key of a Feed-URL inside the database. `id`s are displayed in `rss-o-bot list`.

### list
List all Feed-URLs, their IDs and their filters.

### test-notification [<url>]
Send a test notification over the defined "notification-methods"

### poll-telegram
Continuously checks telegram for incomming messages. When a message is sent to the defined Telegram Bot, the ID of the sender will be displayed. This ID then may be used as part of the configured "telegram-recipients" array. For further information on the configuration of Telegram notifications check the configuration reference below.

### import <path>
OPML import. Takes a <path> to an OPML-file as a parameter and scanns it for outline elements. It's standard for RSS clients to provide an OPML export. These contain outline tags which the importer searches for. From those tags, the xmlUrl or Url Attributes are read as feed-URLs.

### export
Exports the RSS feeds as OPML to STDOUT. The export does not include the defined filters. Simply beacause, there is no standard way of exporting those.

## Configuration
RSS-o-Bot checks three places for configuration files. `$HOME/.rss-o-bot`, or `%USERPROFILE%\.rss-o-bot` on windows, `/etc/.rss-o-bot` and `${__dirname}/config.json`. The last is the root directory of the NPM package. It is only meant for development puposes. The files are check for their existance in that order (except for `config.json` which is checked first).

The configuration file should contain a single JSON-object on the root level. Use the example configuration inside the README as a reference. These are the available configuration options:

### notification-methods
An array of methods. When a new item appears in a stream, a notification will be sent over the defined methods. Available methods are `telegam` and `desktop`.

### telegram-api-token
A Telegram API token. It can be retrieved, by writting a message `/start` to `@BotFather`. The rest will be explained by the Bot Father. Notifications will be sent from the Bot if you include `telegram` in your `notification-methods`, set this option and set a `telegram-recipients`.

## telegram-recipients
An array of Telegram user IDs. User IDs may be retrieved using the `rss-o-bot poll-telegram` command. Check the description above for more information.

## interval
A number in section that defines how often the Feed-URLs should be polled.

## database
An object containing information on the database. It must include a `name` property. If you're database requires a username and password (non-SQLite), set these as the `username` and `password` properties. The object must also include a `options` object containing further information on the database connection. It must at least include a `dialect` and a `storage` attribute. SQLite is the prefered database here, since it has a very low overhead and high portability. The `options` object is passed as-is to Sequelize. Check its [docs](http://sequelize.readthedocs.io/en/latest/api/sequelize/) for further information. Here's an example of a simple `database` configuration:

```
{
  "name": "rssobot",
  "options": {
    "dialect": "sqlite",
    "storage": "~/.rss-o-bot.sqlite"
  }
}
```

## Authors
Kriegslustig <npm@ls7.ch>

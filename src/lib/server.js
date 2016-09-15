const Rx = require('rx')
const { Observable: O } = Rx
const R = require('ramda')
const debug = require('debug')('rss-o-bot')

module.exports = (H, {
  throwO,
  PUBLIC_KEY_ALREADY_EXISTS,
  LOCAL_ONLY_COMMAND_ON_SERVER,
  NO_DATA_IN_REQUEST,
  UNKNOWN_COMMAND,
  FAILED_TO_SAVE_PUB_KEY
}) => {
  const savePublicKey = (config, publicKey) => newPublicKey =>
    Rx.if(
      () => publicKey,
      O.throw({ error: PUBLIC_KEY_ALREADY_EXISTS }),
      H.writeFile(H.publicKeyPath(config), newPublicKey)
    )
  const executeCommand = (state, commands) => ({ command, args }) => {
    debug(`Executing command ${command}`)
    const cState = H.setCommandState(state)(
      H.findCommand(commands, command, args)
    )
    if (!cState.get('command')) return throwO(UNKNOWN_COMMAND)
    return (
      cState.get('localOnly') && command !== 'ping'
        ? throwO(LOCAL_ONLY_COMMAND_ON_SERVER)
        : cState.get('command')(state)
    )
  }

  const Server = {
    run: commands => state => {
      const exec = executeCommand(state, commands)
      return (
        H.httpServer(state.getIn(['configuration', 'port']))
          .flatMap(x => {
            if (H.is('Symbol')(x)) return O.of(x)
            const [ data, respond ] = x
            if (data.length < 1) {
              return respond(500)({ error: NO_DATA_IN_REQUEST })
            } else if (data.indexOf('PUBLIC KEY') > -1) {
              return savePublicKey(state.get('configuration'), state.get('publicKey'))
            } else {
              return (
                H.verifyJwt(state.get('publicKey'))(data)
                  .flatMap(R.cond([
                    [
                      R.where({
                        command: H.is('String'),
                        args: R.allPass([H.is('Array'), R.all(H.is('String'))])
                      }),
                      (command) =>
                        exec(command)
                          .flatMap(output => respond(200)({ output }))
                    ],
                    [R.T, () => respond(500)({ error: NO_DATA_IN_REQUEST })]
                  ]))
                  .catch(err => {
                    debug(err)
                    return respond(500)({ error: NO_DATA_IN_REQUEST })
                  })
              )
            }
          })
      )
    }
  }

  return Server
}


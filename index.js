//
//  index.js
//  live-streaming-nodejs
//
//  Created by Sven Herzberg on 2022-06-20.
//

const { Realtime } = require('ably')

// This is your market data API key: https://docs.lemon.markets/authentication
const secret = 'YOUR-API-KEY'

const instruments = [
  'US64110L1061', // Netflix
  'US88160R1014', // Tesla
]

liveStreaming()

async function liveStreaming () {
  if (process.version < 'v17.5') {
    throw Error(`Node.js introduced fetch() in version v17.5. This is node.js ${process.version}. Please update.`)
  }
  if (typeof fetch !== 'function') {
    throw Error(`Node.js versions prior to v18 need the command line option '--experimental-fetch'. This is node.js ${process.version}`)
  }
  const response = await fetch('https://realtime.lemon.markets/v1/auth', {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${secret}`
    }
  })
  const {user_id, token, expires_at} = await response.json()
  // **NOTE:** Use `expires_at` to reconnect, because this connection will stop
  // receiving data.
  console.log("token expires at:", Date(expires_at))

  const connection = new Realtime({
    token: token,
    transportParams: { remainPresentFor: 1000 }
  })

  const channelQuotes = connection.channels.get(user_id)
  channelQuotes.subscribe((message) => {
    const {name, data} = message
    switch (name) {
    case 'quotes':
      console.log('quotes', data)
      break
    default:
      console.log('unexpected message:', name, data)
    }
  })
  const channelSubscriptions = connection.channels.get(`${user_id}.subscriptions`)
  channelSubscriptions.publish('isins', instruments.join(','), (err) => {
    console.log('publish subscriptions error', err)
  })
  console.log('awaiting messages…')
}

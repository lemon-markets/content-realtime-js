//
//  index.js
//  live-streaming-js
//
//  Created by Sven Herzberg on 2022-06-20.
//

const ably = require('ably')

const secret = 'YOUR-API-KEY'
const instruments = [
  'US64110L1061', // Netflix
  'US88160R1014', // Tesla
]

liveStreaming()

async function liveStreaming () {
  const response = await fetch('https://realtime.lemon.markets/v1/auth', {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${secret}`
    }
  })
  const {user_id, token, expires_at} = await response.json()
  console.log(user_id, token, expires_at)
  // **NOTE:** Use `expires_at` to reconnect, because this connection will stop
  // receiving data.

  const connection = new ably.Realtime({
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

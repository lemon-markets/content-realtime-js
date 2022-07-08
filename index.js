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

const spinner = '-\\|/'
let updateCounter = 0
let latestQuotes = {}

async function liveStreaming () {
  if (process.version < 'v17.5') {
    throw Error(`Node.js introduced fetch() in version v17.5. This is node.js ${process.version}. Please update.`)
  }
  if (typeof fetch !== 'function') {
    throw Error(`Node.js versions prior to v18 need the command line option '--experimental-fetch'. This is node.js ${process.version}`)
  }
  console.log('Fetching credentials for live streaming…')
  const response = await fetch('https://realtime.lemon.markets/v1/auth', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secret}`
    }
  })
  const {user_id, token, expires_at} = await response.json()
  // **NOTE:** Use `expires_at` to reconnect, because this connection will stop
  // receiving data.
  console.log('token expires at:', Date(expires_at))

  console.log('Fetched. Connecting Ably client…')
  const connection = new Realtime({
    token: token,
    transportParams: { remainPresentFor: 1000 }
  })

  console.log(`Connected. Subscribing to ${user_id}…`)
  const channelQuotes = connection.channels.get(user_id)
  channelQuotes.subscribe((message) => {
    const {name, data} = message
    switch (name) {
    case 'quotes':
      latestQuotes[data.isin] = data
      updateCounter += 1
      printQuotes()
      break
    default:
      console.log('unexpected message:', name, data)
    }
  })

  console.log(`Subscribed. Publishing requested instruments to ${user_id}.subscriptions…`)
  const channelSubscriptions = connection.channels.get(`${user_id}.subscriptions`)
  channelSubscriptions.publish('isins', instruments.join(','), (err) => {
      if (err) {
          console.log('publish subscriptions error', err)
      }
  })
  console.log('Published. Fetching latest quotes for initialization…')
  const quotes = await fetch('https://data.lemon.markets/v1/quotes/latest?decimals=false&epoch=true&isin=' + instruments.join(','), {
    headers: {
      'Authorization': `Bearer ${secret}`
    }
  })
  for (const quote of (await quotes.json()).results) {
      latestQuotes[quote.isin] = quote
  }
  printQuotes()
}

function printQuotes () {
  process.stdout.write('\r')
    for (const instrument of instruments) {
        const quote = latestQuotes[instrument]
        const date = new Date(quote.t)
        process.stdout.write(`${instrument}:ask=${quote.a},bid=${quote.b},date=${date.toISOString()} `)
    }
  process.stdout.write(spinner[updateCounter % spinner.length])
}

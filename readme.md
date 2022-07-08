# Live Streaming for 🍋.markets

This is a small example about using the [live streaming API](https://docs.lemon.markets/live-streaming/overview) from [lemon.markets](https://lemon.markets/) using `node.js`.

## Quick Start

**NOTE:** This sample project works best with node.js v18+.

1. Open `index.js` and replace `YOUR-API-KEY` with your paper trading API key
2. Install the Ably SDK via `npm install`
3. Run the code via `node index.js`

You should see something like this:

```
Fetching credentials for live streaming…
(node:31759) ExperimentalWarning: The Fetch API is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
token expires at: Fri Jul 08 2022 09:41:17 GMT+0200 (Central European Summer Time)
Fetched. Connecting Ably client…
09:41:17.009 Ably: Auth(): Warning: library initialized with a token literal without any way to renew the token when it expires (no authUrl, authCallback, or key). See https://help.ably.io/error/40171 for help
Connected. Subscribing to usr_qyJDQss5546j0bXjtWtLlRC3B4CNBdmg9V…
Subscribed. Publishing requested instruments to usr_qyJDQss5546j0bXjtWtLlRC3B4CNBdmg9V.subscriptions…
Published. Fetching latest quotes for initialization…
US64110L1061:ask=1868400,bid=1863600,date=2022-07-08T07:41:11.000Z US88160R1014:ask=7252000,bid=7235000,date=2022-07-08T07:41:19.300Z -
```

If you pay close attention, you will notice updates to the data in the bottom line as your code receives new updates.

### Error messages

How are error messages propagated from a transport worker to Pino?

Let's assume we have a transport with an error listener:

```js
// index.js
const transport = pino.transport({
  target: './transport.js'
})

transport.on('error', err => {
  console.error('error caught', err)
})

const log = pino(transport)
```

When our worker emits an error event, the worker has listeners for it: [error](https://github.com/pinojs/thread-stream/blob/f19ac8dbd602837d2851e17fbc7dfc5bbc51083f/lib/worker.js#L59-L70) and [unhandledRejection](https://github.com/pinojs/thread-stream/blob/f19ac8dbd602837d2851e17fbc7dfc5bbc51083f/lib/worker.js#L135-L141). These listeners send the error message to the main thread where Pino is present.

When Pino receives the error message, it further [emits](https://github.com/pinojs/thread-stream/blob/f19ac8dbd602837d2851e17fbc7dfc5bbc51083f/index.js#L349) the error message. Finally, the error message arrives at our `index.js` and is caught by our error listener.

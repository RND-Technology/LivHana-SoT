### Creating a transport pipeline

As an example, the following transport returns a `Transform` stream:

```js
import build from 'pino-abstract-transport'
import { pipeline, Transform } from 'node:stream'
export default async function (options) {
  return build(function (source) {
    const myTransportStream = new Transform({
      // Make sure autoDestroy is set,
      // this is needed in Node v12 or when using the
      // readable-stream module.
      autoDestroy: true,

      objectMode: true,
      transform (chunk, enc, cb) {

        // modifies the payload somehow
        chunk.service = 'pino'

        // stringify the payload again
        this.push(`${JSON.stringify(chunk)}\n`)
        cb()
      }
    })
    pipeline(source, myTransportStream, () => {})
    return myTransportStream
  }, {
    // This is needed to be able to pipeline transports.
    enablePipelining: true
  })
}
```

Then you can pipeline them with:

```js
import pino from 'pino'

const logger = pino({
  transport: {
    pipeline: [{
      target: './my-transform.js'
    }, {
      // Use target: 'pino/file' with STDOUT descriptor 1 to write
      // logs without any change.
      target: 'pino/file',
      options: { destination: 1 }
    }]
  }
})

logger.info('hello world')
```

__NOTE: there is no "default" destination for a pipeline but
a terminating target, i.e. a `Writable` stream.__

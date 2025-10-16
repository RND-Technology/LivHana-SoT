### Writing to a custom transport & stdout

In case you want to both use a custom transport, and output the log entries with default processing to STDOUT, you can use 'pino/file' transport configured with `destination: 1`:

```js
    const transports = [
      {
        target: 'pino/file',
        options: { destination: 1 } // this writes to STDOUT
      },
      {
        target: 'my-custom-transport',
        options: { someParameter: true } 
      }
    ]

    const logger = pino(pino.transport({ targets: transports }))
```

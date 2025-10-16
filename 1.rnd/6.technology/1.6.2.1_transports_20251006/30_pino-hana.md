### pino-hana

[pino-hana](https://github.com/HiImGiovi/pino-hana) is a Pino v7+ transport that save pino logs to a SAP HANA database.

```js
const pino = require('pino')
const logger = pino({
  transport: {
    target: 'pino-hana',
    options: {
      connectionOptions: {
        host: <hana db host>,
        port: <hana db port>,
        user: <hana db user>,
        password: <hana db password>,
      },
      schema: <schema of the table in which you want to save the logs>,
      table: <table in which you want to save the logs>,
    },
  },
})

logger.info('hi') // this log will be saved into SAP HANA
```

For more detailed information about its usage please check the official [documentation](https://github.com/HiImGiovi/pino-hana#readme).

<a id="pino-http-send"></a>

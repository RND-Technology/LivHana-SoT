### pino-mq

The `pino-mq` transport will take all messages received on `process.stdin` and send them over a message bus using JSON serialization.

This is useful for:

- moving backpressure from application to broker
- transforming messages pressure to another component

```
node app.js | pino-mq -u "amqp://guest:guest@localhost/" -q "pino-logs"
```

Alternatively, a configuration file can be used:

```
node app.js | pino-mq -c pino-mq.json
```

A base configuration file can be initialized with:

```
pino-mq -g
```

For full documentation of command line switches and configuration see [the `pino-mq` README](https://github.com/itavy/pino-mq#readme)

<a id="pino-mysql"></a>

### pino-syslog

[pino-syslog][pino-syslog] is a transforming transport that converts
`pino` NDJSON logs to [RFC3164][rfc3164] compatible log messages. The `pino-syslog` module does not
forward the logs anywhere, it merely re-writes the messages to `stdout`. But
when used in combination with `pino-socket` the log messages can be relayed to a syslog server:

```sh
node app.js | pino-syslog | pino-socket -a syslog.example.com
```

Example output for the "hello world" log:

```
<134>Apr  1 16:44:58 MacBook-Pro-3 none[94473]: {"pid":94473,"hostname":"MacBook-Pro-3","level":30,"msg":"hello world","time":1459529098958}
```

[pino-syslog]: https://www.npmjs.com/package/pino-syslog
[rfc3164]: https://tools.ietf.org/html/rfc3164
[logstash]: https://www.elastic.co/products/logstash

<a id="pino-telegram-webhook"></a>

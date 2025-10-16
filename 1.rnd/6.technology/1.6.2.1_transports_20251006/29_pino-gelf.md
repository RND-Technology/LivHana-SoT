### pino-gelf

Pino GELF ([pino-gelf]) is a transport for the Pino logger. Pino GELF receives Pino logs from stdin and transforms them into [GELF format][gelf] before sending them to a remote [Graylog server][graylog] via UDP.

```sh
node your-app.js | pino-gelf log
```

[pino-gelf]: https://github.com/pinojs/pino-gelf
[gelf]: https://docs.graylog.org/en/2.1/pages/gelf.html
[graylog]: https://www.graylog.org/

<a id="pino-hana"></a>

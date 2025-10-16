### pino-yc-transport

[pino-yc-transport](https://github.com/Jhon-Mosk/pino-yc-transport) is a Pino v7+ transport for writing to [Yandex Cloud Logging](https://yandex.cloud/ru/services/logging) from serveless functions or containers.

```js
const pino = require("pino");

const config = {
  level: "debug",
  transport: {
    target: "pino-yc-transport",
  },
};

const logger = pino(config);

logger.debug("some message")
logger.debug({ foo: "bar" });
logger.debug("some message %o, %s", { foo: "bar" }, "baz");
logger.info("info");
logger.warn("warn");
logger.error("error");
logger.error(new Error("error"));
logger.fatal("fatal");
```

<a id="communication-between-pino-and-transport"></a>

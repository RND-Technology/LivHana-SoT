### pino-telegram-webhook

[pino-telegram-webhook](https://github.com/Jhon-Mosk/pino-telegram-webhook) is a Pino v7+ transport for sending messages to [Telegram](https://telegram.org/).

```js
const pino = require('pino');

const logger = pino({
  transport: {
    target: 'pino-telegram-webhook',
    level: 'error',
    options: {
      chatId: -1234567890,
      botToken: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
      extra: {
              parse_mode: "HTML",
            },
    },
  },
})

logger.error('<b>test log!</b>');
```

The `extra` parameter is optional. Parameters that the method [`sendMessage`](https://core.telegram.org/bots/api#sendmessage) supports can be passed to it.

<a id="pino-websocket"></a>

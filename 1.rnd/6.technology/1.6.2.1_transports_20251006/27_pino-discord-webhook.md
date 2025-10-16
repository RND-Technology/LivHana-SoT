### pino-discord-webhook

[pino-discord-webhook](https://github.com/fabulousgk/pino-discord-webhook) is a  Pino v7+ compatible transport to forward log events to a [Discord](http://discord.com) webhook from a dedicated worker.

```js
import pino from 'pino'

const logger = pino({
  transport: {
    target: 'pino-discord-webhook',
    options: {
      webhookUrl: 'https://discord.com/api/webhooks/xxxx/xxxx',
    }
  }
})
```

<a id="pino-elasticsearch"></a>

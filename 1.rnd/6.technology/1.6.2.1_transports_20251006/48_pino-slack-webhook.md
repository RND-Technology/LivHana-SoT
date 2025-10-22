### pino-slack-webhook

[pino-slack-webhook][pino-slack-webhook] is a Pino v7+ compatible transport to forward log events to [Slack][Slack]
from a dedicated worker:

```js
const pino = require('pino')
const transport = pino.transport({
  target: '@youngkiu/pino-slack-webhook',
  options: {
    webhookUrl: 'https://hooks.slack.com/services/xxx/xxx/xxx',
    channel: '#pino-log',
    username: 'webhookbot',
    icon_emoji: ':ghost:'
  }
})
pino(transport)
```

[pino-slack-webhook]: https://github.com/youngkiu/pino-slack-webhook
[Slack]: https://slack.com/

For full documentation of command line switches read the [README](https://github.com/abeai/pino-websocket#readme).

<a id="pino-socket"></a>

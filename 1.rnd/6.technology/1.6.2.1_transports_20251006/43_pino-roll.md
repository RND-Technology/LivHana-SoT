### pino-roll

`pino-roll` is a Pino transport that automatically rolls your log files based on size or time frequency.

```js
import { join } from 'path';
import pino from 'pino';

const transport = pino.transport({
  target: 'pino-roll',
  options: { file: join('logs', 'log'), frequency: 'daily', mkdir: true }
});

const logger = pino(transport);
```

then you can use the logger as usual:

```js
logger.info('Hello from pino-roll!');
```

For full documentation check the [README](https://github.com/mcollina/pino-roll?tab=readme-ov-file#pino-roll).

<a id="pino-sentry"></a>

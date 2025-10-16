### @macfja/pino-fingers-crossed

[@macfja/pino-fingers-crossed](https://github.com/MacFJA/js-pino-fingers-crossed) is a Pino v7+ transport that holds logs until a log level is reached, allowing to only have logs when it matters.

```js
const pino = require('pino');
const { default: fingersCrossed, enable } = require('@macfja/pino-fingers-crossed')

const logger = pino(fingersCrossed());

logger.info('Will appear immedialty')
logger.error('Will appear immedialty')

logger.setBindings({ [enable]: 50 })
logger.info('Will NOT appear immedialty')
logger.info('Will NOT appear immedialty')
logger.error('Will appear immedialty as well as the 2 previous messages') // error log are level 50
logger.info('Will NOT appear')
logger.info({ [enable]: false }, 'Will appear immedialty')
logger.info('Will NOT appear')
```

<a id="pino-openobserve"></a>

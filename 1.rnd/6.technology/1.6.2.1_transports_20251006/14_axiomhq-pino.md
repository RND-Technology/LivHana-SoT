### @axiomhq/pino

[@axiomhq/pino](https://www.npmjs.com/package/@axiomhq/pino) is the official [Axiom](https://axiom.co/) transport for Pino, using [axiom-js](https://github.com/axiomhq/axiom-js).

```javascript
import pino from 'pino';

const logger = pino(
  { level: 'info' },
  pino.transport({
    target: '@axiomhq/pino',
    options: {
      dataset: process.env.AXIOM_DATASET,
      token: process.env.AXIOM_TOKEN,
    },
  }),
);
```

then you can use the logger as usual:

```js
logger.info('Hello from pino!');
```

For further examples, head over to the [examples](https://github.com/axiomhq/axiom-js/tree/main/examples/pino) directory.

<a id="@logtail/pino"></a>

### pino-seq

[pino-seq][pino-seq] supports both out-of-process and in-process log forwarding to [Seq][Seq].

```sh
node app.js | pino-seq --serverUrl http://localhost:5341 --apiKey 1234567890 --property applicationName=MyNodeApp
```

[pino-seq]: https://www.npmjs.com/package/pino-seq
[Seq]: https://datalust.co/seq

<a id="pino-seq-transport"></a>

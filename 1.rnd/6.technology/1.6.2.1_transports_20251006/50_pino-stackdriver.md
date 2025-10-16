### pino-stackdriver

The [pino-stackdriver](https://www.npmjs.com/package/pino-stackdriver) module is a transport that will forward logs to the [Google Stackdriver](https://cloud.google.com/logging/) log service through its API.

Given an application `foo` that logs via pino, a stackdriver log project `bar`, and credentials in the file `/credentials.json`, you would use `pino-stackdriver`
like so:

``` sh
node foo | pino-stackdriver --project bar --credentials /credentials.json
```

For full documentation of command line switches read [README](https://github.com/ovhemert/pino-stackdriver#readme)

<a id="pino-syslog"></a>

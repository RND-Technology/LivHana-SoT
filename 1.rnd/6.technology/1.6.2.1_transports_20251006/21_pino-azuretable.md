### pino-azuretable

The [pino-azuretable](https://www.npmjs.com/package/pino-azuretable) module is a transport that will forward logs to the [Azure Table Storage](https://azure.microsoft.com/en-us/services/storage/tables/).

Given an application `foo` that logs via pino, you would use `pino-azuretable` like so:

``` sh
node foo | pino-azuretable --account storageaccount --key blablabla
```

For full documentation of command line switches read [README](https://github.com/ovhemert/pino-azuretable#readme)

<a id="pino-cloudwatch"></a>

### pino-datadog

The [pino-datadog](https://www.npmjs.com/package/pino-datadog) module is a transport that will forward logs to [DataDog](https://www.datadoghq.com/) through its API.

Given an application `foo` that logs via pino, you would use `pino-datadog` like so:

``` sh
node foo | pino-datadog --key blablabla
```

For full documentation of command line switches read [README](https://github.com/ovhemert/pino-datadog#readme)

<a id="pino-datadog-transport"></a>

### pino-applicationinsights

The [pino-applicationinsights](https://www.npmjs.com/package/pino-applicationinsights) module is a transport that will forward logs to [Azure Application Insights](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview).

Given an application `foo` that logs via pino, you would use `pino-applicationinsights` like so:

``` sh
node foo | pino-applicationinsights --key blablabla
```

For full documentation of command line switches read [README](https://github.com/ovhemert/pino-applicationinsights#readme)

<a id="pino-axiom"></a>

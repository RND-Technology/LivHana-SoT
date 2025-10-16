### pino-socket

[pino-socket][pino-socket] is a transport that will forward logs to an IPv4
UDP or TCP socket.

As an example, use `socat` to fake a listener:

```sh
socat -v udp4-recvfrom:6000,fork exec:'/bin/cat'
```

Then run an application that uses `pino` for logging:

```sh
node app.js | pino-socket -p 6000
```

Logs from the application should be observed on both consoles.

[pino-socket]: https://www.npmjs.com/package/pino-socket

<a id="pino-stackdriver"></a>

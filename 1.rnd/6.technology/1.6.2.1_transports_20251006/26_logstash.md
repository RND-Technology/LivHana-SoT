#### Logstash

The [pino-socket][pino-socket] module can also be used to upload logs to
[Logstash][logstash] via:

```
node app.js | pino-socket -a 127.0.0.1 -p 5000 -m tcp
```

Assuming logstash is running on the same host and configured as
follows:

```
input {
  tcp {
    port => 5000
  }
}

filter {
  json {
    source => "message"
  }
}

output {
  elasticsearch {
    hosts => "127.0.0.1:9200"
  }
}
```

See <https://www.elastic.co/guide/en/kibana/current/setup.html> to learn
how to setup [Kibana][kibana].

For Docker users, see
<https://github.com/deviantony/docker-elk> to setup an ELK stack.

<a id="pino-discord-webhook"></a>

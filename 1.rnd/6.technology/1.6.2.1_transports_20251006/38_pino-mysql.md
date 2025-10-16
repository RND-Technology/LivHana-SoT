### pino-mysql

[pino-mysql][pino-mysql] loads pino logs into [MySQL][MySQL] and [MariaDB][MariaDB].

```sh
node app.js | pino-mysql -c db-configuration.json
```

`pino-mysql` can extract and save log fields into corresponding database fields
and/or save the entire log stream as a [JSON Data Type][JSONDT].

For full documentation and command line switches read the [README][pino-mysql].

[pino-mysql]: https://www.npmjs.com/package/pino-mysql
[MySQL]: https://www.mysql.com/
[MariaDB]: https://mariadb.org/
[JSONDT]: https://dev.mysql.com/doc/refman/8.0/en/json.html

<a id="pino-opentelemetry-transport"></a>

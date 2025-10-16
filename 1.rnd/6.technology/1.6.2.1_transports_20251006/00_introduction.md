<!-- Optimized: 2025-10-06 -->
<!-- RPM: 1.6.2.1.1.6.2.1_transports_20251006 -->
<!-- Session: E2E RPM DNA Application -->
<!-- AOM: RND (Reggie & Dro) -->
<!-- COI: TECHNOLOGY -->
<!-- RPM: HIGH -->
<!-- ACTION: BUILD -->

# Transports

Pino transports can be used for both transmitting and transforming log output.

The way Pino generates logs:

1. Reduces the impact of logging on an application to the absolute minimum.
2. Gives greater flexibility in how logs are processed and stored.

It is recommended that any log transformation or transmission is performed either
in a separate thread or a separate process.

Before Pino v7 transports would ideally operate in a separate process - these are
now referred to as [Legacy Transports](#legacy-transports).

From Pino v7 and upwards transports can also operate inside a [Worker Thread][worker-thread]
and can be used or configured via the options object passed to `pino` on initialization.
In this case the transports would always operate asynchronously (unless `options.sync` is set to `true` in transport options), and logs would be
flushed as quickly as possible (there is nothing to do).

[worker-thread]: https://nodejs.org/dist/latest-v14.x/docs/api/worker_threads.html

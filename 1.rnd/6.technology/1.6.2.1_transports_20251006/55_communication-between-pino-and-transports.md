## Communication between Pino and Transports

Here we discuss some technical details of how Pino communicates with its [worker threads](https://nodejs.org/api/worker_threads.html).

Pino uses [`thread-stream`](https://github.com/pinojs/thread-stream) to create a stream for transports.
When we create a stream with `thread-stream`, `thread-stream` spawns a [worker](https://github.com/pinojs/thread-stream/blob/f19ac8dbd602837d2851e17fbc7dfc5bbc51083f/index.js#L50-L60) (an independent JavaScript execution thread).

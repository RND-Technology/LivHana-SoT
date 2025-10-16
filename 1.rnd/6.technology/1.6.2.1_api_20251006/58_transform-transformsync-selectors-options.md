### `transform|transformSync(selectors, [options])`

Like `process()` and `processSync()` but after
processing the `selectors` these methods return the value returned by the
processor callback.

Note: when the `updateSelector` option is set, the rule's selector
will be updated with the resulting string.

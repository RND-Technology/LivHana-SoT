### `ast|astSync(selectors, [options])`

Like `process()` and `processSync()` but after
processing the `selectors` these methods return the `Root` node of the result
instead of a string.

Note: when the `updateSelector` option is set, the rule's selector
will be updated with the resulting string.

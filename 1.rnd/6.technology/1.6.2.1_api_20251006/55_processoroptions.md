### `ProcessorOptions`

* `lossless` - When `true`, whitespace is preserved. Defaults to `true`.
* `updateSelector` - When `true`, if any processor methods are passed a postcss
  `Rule` node instead of a string, then that Rule's selector is updated
  with the results of the processing. Defaults to `true`.

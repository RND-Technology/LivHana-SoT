### `parser.combinator([props])`

Creates a new selector combinator.

```js
parser.combinator({value: '+'});
// => +
```

Arguments:

* `props (object)`: The new node's properties.

Notes:

* **Descendant Combinators** The value of descendant combinators created by the
  parser always just a single space (`" "`). For descendant selectors with no
  comments, additional space is now stored in `node.spaces.before`. Depending
  on the location of comments, additional spaces may be stored in
  `node.raws.spaces.before`, `node.raws.spaces.after`, or `node.raws.value`.
* **Named Combinators** Although, nonstandard and unlikely to ever become a standard,
  named combinators like `/deep/` and `/for/` are parsed as combinators. The
  `node.value` is name after being unescaped and normalized as lowercase. The
  original value for the combinator name is stored in `node.raws.value`.

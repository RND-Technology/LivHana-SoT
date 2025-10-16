### `node.replaceWith(node)`

Replace a node with another.

```js
const attr = selectors.first.first;
const className = parser.className({value: 'test'});
attr.replaceWith(className);
```

Arguments:

* `node`: The node to substitute the original with.

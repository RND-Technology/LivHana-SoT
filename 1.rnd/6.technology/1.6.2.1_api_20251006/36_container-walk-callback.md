### `container.walk(callback)`

Like `container#each`, but will also iterate child nodes as long as they are
`container` types.

```js
selectors.walk((selector, index) => {
    // all nodes
});
```

Arguments:

* `callback (function)`: A function to call for each node, which receives `node`
  and `index` arguments.

This iterator is safe to use whilst mutating `container.nodes`,
like `container#each`.

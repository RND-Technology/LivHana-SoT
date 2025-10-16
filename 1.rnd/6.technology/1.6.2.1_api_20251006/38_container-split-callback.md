### `container.split(callback)`

This method allows you to split a group of nodes by returning `true` from
a callback. It returns an array of arrays, where each inner array corresponds
to the groups that you created via the callback.

```js
// (input) => h1 h2>>h3
const list = selectors.first.split(selector => {
    return selector.type === 'combinator';
});

// (node values) => [['h1', ' '], ['h2', '>>'], ['h3']]
```

Arguments:

* `callback (function)`: A function to call for each node, which receives `node`
  as an argument.

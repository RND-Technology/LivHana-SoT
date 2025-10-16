### `container.each(callback)`

Iterate the container's immediate children, calling `callback` for each child.
You may return `false` within the callback to break the iteration.

```js
let className;
selectors.each((selector, index) => {
    if (selector.type === 'class') {
        className = selector.value;
        return false;
    }
});
```

Note that unlike `Array#forEach()`, this iterator is safe to use whilst adding
or removing nodes from the container.

Arguments:

* `callback (function)`: A function to call for each node, which receives `node`
  and `index` arguments.

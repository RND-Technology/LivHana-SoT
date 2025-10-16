### `container.removeChild(node)`

Remove the node from the container. Note that you can also use
`node.remove()` if you would like to remove just a single node.

```js
selector.length // => 2
selector.remove(id)
selector.length // => 1;
id.parent       // undefined
```

Arguments:

* `node`: The node to remove.

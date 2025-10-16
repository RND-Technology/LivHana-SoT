### `container.prepend(node)` & `container.append(node)`

Add a node to the start/end of the container. Note that doing so will set
the parent property of the node to this container.

```js
const id = parser.id({value: 'search'});
selector.append(id);
```

Arguments:

* `node`: The node to add.

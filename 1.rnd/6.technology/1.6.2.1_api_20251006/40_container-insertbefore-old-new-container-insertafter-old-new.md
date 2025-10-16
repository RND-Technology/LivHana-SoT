### `container.insertBefore(old, new)` & `container.insertAfter(old, new)`

Add a node before or after an existing node in a container:

```js
selectors.walk(selector => {
    if (selector.type !== 'class') {
        const className = parser.className({value: 'theme-name'});
        selector.parent.insertAfter(selector, className);
    }
});
```

Arguments:

* `old`: The existing node in the container.
* `new`: The new node to add before/after the existing node.

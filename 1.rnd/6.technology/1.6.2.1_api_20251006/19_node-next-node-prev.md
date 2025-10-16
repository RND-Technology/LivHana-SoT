### `node.next()` & `node.prev()`

Returns the next/previous child of the parent node.

```js
const next = id.next();
if (next && next.type !== 'combinator') {
    throw new Error('Qualified IDs are not allowed!');
}
```

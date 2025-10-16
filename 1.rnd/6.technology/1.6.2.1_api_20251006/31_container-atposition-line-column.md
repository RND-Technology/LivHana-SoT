### `container.atPosition(line, column)`

Returns the node at the source position `line` and `column`.

```js
// Input: :not(.foo),\n#foo > :matches(ol, ul)
selector.atPosition(1, 1); // => :not(.foo)
selector.atPosition(2, 1); // => \n#foo
```

Arguments:

* `line`: The line number of the node to return.
* `column`: The column number of the node to return.

### `node.source`

An object describing the node's start/end, line/column source position.

Within the following CSS, the `.bar` class node ...

```css
.foo,
  .bar {}
```

... will contain the following `source` object.

```js
source: {
    start: {
        line: 2,
        column: 3
    },
    end: {
        line: 2,
        column: 6
    }
}
```

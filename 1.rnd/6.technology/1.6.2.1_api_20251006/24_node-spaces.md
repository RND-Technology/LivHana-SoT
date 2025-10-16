### `node.spaces`

Extra whitespaces around the node will be moved into `node.spaces.before` and
`node.spaces.after`. So for example, these spaces will be moved as they have
no semantic meaning:

```css
      h1     ,     h2   {}
```

For descendent selectors, the value is always a single space.

```css
h1        h2 {}
```

Additional whitespace is found in either the `node.spaces.before` and `node.spaces.after` depending on the presence of comments or other whitespace characters. If the actual whitespace does not start or end with a single space, the node's raw value is set to the actual space(s) found in the source.

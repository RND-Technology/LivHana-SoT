### `node.type`

A string representation of the selector type. It can be one of the following;
`attribute`, `class`, `combinator`, `comment`, `id`, `nesting`, `pseudo`,
`root`, `selector`, `string`, `tag`, or `universal`. Note that for convenience,
these constants are exposed on the main `parser` as uppercased keys. So for
example you can get `id` by querying `parser.ID`.

```js
parser.attribute({attribute: 'href'}).type;
// => 'attribute'
```

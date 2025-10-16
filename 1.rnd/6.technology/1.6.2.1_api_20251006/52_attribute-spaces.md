### `attribute.spaces`

Like `node.spaces` with the `before` and `after` values containing the spaces
around the element, the parts of the attribute can also have spaces before
and after them. The for each of `attribute`, `operator`, `value` and
`insensitive` there is corresponding property of the same nam in
`node.spaces` that has an optional `before` or `after` string containing only
whitespace.

Note that corresponding values in `attributes.raws.spaces` contain values
including any comments. If set, these values will override the
`attribute.spaces` value. Take care to remove them if changing
`attribute.spaces`.

### `attribute.raws`

The raws object stores comments and other information necessary to re-render
the node exactly as it was in the source.

If a comment is embedded within the identifiers for the `namespace`, `attribute`
or `value` then a property is placed in the raws for that value containing the full source of the propery including comments.

If a comment is embedded within the space between parts of the attribute
then the raw for that space is set accordingly.

Setting an attribute's property `raws` value to be deleted.

For now, changing the spaces required also updating or removing any of the
raws values that override them.

Example: `[ /*before*/ href /* after-attr */ = /* after-operator */ te/*inside-value*/st/* wow */ /*omg*/i/*bbq*/ /*whodoesthis*/]` would parse as:

```js
{
  attribute: "href",
  operator: "=",
  value: "test",
  spaces: {
    before: '',
    after: '',
    attribute: { before: '  ', after: '  ' },
    operator: { after: '  ' },
    value: { after: ' ' },
    insensitive: { after: ' ' }
  },
  raws: {
    spaces: {
      attribute: { before: ' /*before*/ ', after: ' /* after-attr */ ' },
      operator: { after: ' /* after-operator */ ' },
      value: { after: '/* wow */ /*omg*/' },
      insensitive: { after: '/*bbq*/ /*whodoesthis*/' }
    },
    unquoted: 'test',
    value: 'te/*inside-value*/st'
  }
}
```

### `attribute.raws.unquoted`

Returns the unquoted content of the attribute's value.
Remains `undefined` if there is no attribute value.

```css
[href=foo] /* foo */
[href='foo'] /* foo */
[href="foo"] /* foo */
[href] /* undefined */
```

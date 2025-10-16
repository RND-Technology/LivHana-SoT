### `attribute.quoted`

Returns `true` if the attribute's value is wrapped in quotation marks, false if it is not.
Remains `undefined` if there is no attribute value.

```css
[href=foo] /* false */
[href='foo'] /* true */
[href="foo"] /* true */
[href] /* undefined */
```

## Pseudo nodes

A pseudo selector extends a container node; if it has any parameters of its
own (such as `h1:not(h2, h3)`), they will be its children. Note that the pseudo
`value` will always contain the colons preceding the pseudo identifier. This
is so that both `:before` and `::before` are properly represented in the AST.

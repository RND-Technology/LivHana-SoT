### `node.isAtPosition(line, column)`

Return a `boolean` indicating whether this node includes the character at the
position of the given line and column. Returns `undefined` if the nodes lack
sufficient source metadata to determine the position.

Arguments:

* `line`: 1-index based line number relative to the start of the selector.
* `column`: 1-index based column number relative to the start of the selector.

### `attribute.offsetOf(part)`

 Returns the offset of the attribute part specified relative to the
 start of the node of the output string. This is useful in raising
 error messages about a specific part of the attribute, especially
 in combination with `attribute.sourceIndex`.

 Returns `-1` if the name is invalid or the value doesn't exist in this
 attribute.

 The legal values for `part` are:

* `"ns"` - alias for "namespace"
* `"namespace"` - the namespace if it exists.
* `"attribute"` - the attribute name
* `"attributeNS"` - the start of the attribute or its namespace
* `"operator"` - the match operator of the attribute
* `"value"` - The value (string or identifier)
* `"insensitive"` - the case insensitivity flag

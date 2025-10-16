### Error Handling Within Selector Processors

The root node passed to the selector processor callback
has a method `error(message, options)` that returns an
error object. This method should always be used to raise
errors relating to the syntax of selectors. The options
to this method are passed to postcss's error constructor
([documentation](http://postcss.org/api/#container-error)).

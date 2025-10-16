### `parser([transform], [options])`

Creates a new `processor` instance

```js
const processor = parser();
```

Or, with optional transform function

```js
const transform = selectors => {
    selectors.walkUniversals(selector => {
        selector.remove();
    });
};

const processor = parser(transform)

// Example
const result = processor.processSync('*.class');
// => .class
```

[See processor documentation](#processor)

Arguments:

* `transform (function)`: Provide a function to work with the parsed AST.
* `options (object)`: Provide default options for all calls on the returned `Processor`.

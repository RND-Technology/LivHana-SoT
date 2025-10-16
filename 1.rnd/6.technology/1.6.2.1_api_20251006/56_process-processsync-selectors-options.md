### `process|processSync(selectors, [options])`

Processes the `selectors`, returning a string from the result of processing.

Note: when the `updateSelector` option is set, the rule's selector
will be updated with the resulting string.

**Example:**

```js
const parser = require("postcss-selector-parser");
const processor = parser();

let result = processor.processSync(' .class');
console.log(result);
// =>  .class

// Asynchronous operation
let promise = processor.process(' .class').then(result => {
    console.log(result)
    // => .class
});

// To have the parser normalize whitespace values, utilize the options
result = processor.processSync('  .class  ', {lossless: false});
console.log(result);
// => .class

// For better syntax errors, pass a PostCSS Rule node.
const postcss = require('postcss');
rule = postcss.rule({selector: ' #foo    > a,  .class  '});
processor.process(rule, {lossless: false, updateSelector: true}).then(result => {
    console.log(result);
    // => #foo>a,.class
    console.log("rule:", rule.selector);
    // => rule: #foo>a,.class
})
```

Arguments:

* `selectors (string|postcss.Rule)`: Either a selector string or a PostCSS Rule
  node.
* `[options] (object)`: Process options

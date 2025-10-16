#### Synchronous Error Example

```js
let processor = (root) => {
    root.walkClasses((classNode) => {
        if (/.*[-_]/.test(classNode.value)) {
            let msg = "classes may not have underscores or dashes in them";
            throw root.error(msg, {
                index: classNode.sourceIndex,
                word: classNode.value
            });
        }
    });
};

const postcss = require("postcss");
const parser = require("postcss-selector-parser");
const selectorProcessor = parser(processor);
const plugin = postcss.plugin('classValidator', (options) => {
    return (root) => {
        root.walkRules(rule => {
            selectorProcessor.processSync(rule);
        });
    };
});
postcss(plugin()).process(`
.foo-bar {
  color: red;
}
`.trim(), {from: 'test.css'}).catch((e) => console.error(e.toString()));

// CssSyntaxError: classValidator: ./test.css:1:5: classes may not have underscores or dashes in them
//
// > 1 | .foo-bar {
//     |     ^
//   2 |   color: red;
//   3 | }
```

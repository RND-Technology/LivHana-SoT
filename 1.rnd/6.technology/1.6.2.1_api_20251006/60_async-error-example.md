#### Async Error Example

```js
let processor = (root) => {
    return new Promise((resolve, reject) => {
        root.walkClasses((classNode) => {
            if (/^(.*)[-_]/.test(classNode.value)) {
                let msg = "classes may not have underscores or dashes in them";
                reject(root.error(msg, {
                    index: classNode.sourceIndex + RegExp.$1.length + 1,
                    word: classNode.value
                }));
            }
        });
        resolve();
    });
};

const postcss = require("postcss");
const parser = require("postcss-selector-parser");
const selectorProcessor = parser(processor);
const plugin = postcss.plugin('classValidator', (options) => {
    return (root) => {
        let promises = [];
        root.walkRules(rule => {
            promises.push(selectorProcessor.process(rule));
        });
        return Promise.all(promises);
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

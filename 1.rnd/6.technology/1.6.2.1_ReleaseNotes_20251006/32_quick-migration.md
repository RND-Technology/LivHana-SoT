#### Quick Migration

```js
// change this:
chai.Assertion.includeStack = true;
chai.Assertion.showDiff = false;

// ... to this:
chai.config.includeStack = true;
chai.config.showDiff = false;
```

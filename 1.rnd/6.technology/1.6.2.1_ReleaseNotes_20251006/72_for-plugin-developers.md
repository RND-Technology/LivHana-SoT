#### For Plugin Developers

**1. New Utility - type**: The new utility `.type()` is available as a better implementation of `typeof`
that can be used cross-browser. It handles the inconsistencies of Array, `null`, and `undefined` detection.

* **@param** _{Mixed}_ object to detect type of
* **@return** _{String}_ object type

```js
chai.use(function (c, utils) {
  // some examples
  utils.type({}); // 'object'
  utils.type(null); // `null'
  utils.type(undefined); // `undefined`
  utils.type([]); // `array`
});
```

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _regeneratorKeys;
function _regeneratorKeys(val) {
  const object = Object(val);
  const keys = [];
  var key;
  for (var key in object) {
    keys.unshift(key);
  }
  return function next() {
    while (keys.length) {
      key = keys.pop();
      if (key in object) {
        next.value = key;
        next.done = false;
        return next;
      }
    }
    next.done = true;
    return next;
  };
}

//# sourceMappingURL=regeneratorKeys.js.map

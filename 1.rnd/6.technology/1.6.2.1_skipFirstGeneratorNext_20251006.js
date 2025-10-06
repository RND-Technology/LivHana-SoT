"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _skipFirstGeneratorNext;
function _skipFirstGeneratorNext(fn) {
  return function () {
    const it = fn.apply(this, arguments);
    it.next();
    return it;
  };
}

//# sourceMappingURL=skipFirstGeneratorNext.js.map

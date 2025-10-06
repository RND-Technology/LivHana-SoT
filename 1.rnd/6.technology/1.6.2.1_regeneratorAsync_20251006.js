"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _regeneratorAsync;
const _regeneratorAsyncGen = require("./regeneratorAsyncGen.js");
function _regeneratorAsync(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
  const iter = (0, _regeneratorAsyncGen.default)(innerFn, outerFn, self, tryLocsList, PromiseImpl);
  return iter.next().then(function (result) {
    return result.done ? result.value : iter.next();
  });
}

//# sourceMappingURL=regeneratorAsync.js.map

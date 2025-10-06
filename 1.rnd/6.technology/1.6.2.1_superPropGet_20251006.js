"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _superPropGet;
const _get = require("./get.js");
const _getPrototypeOf = require("./getPrototypeOf.js");
function _superPropGet(classArg, property, receiver, flags) {
  const result = (0, _get.default)((0, _getPrototypeOf.default)(flags & 1 ? classArg.prototype : classArg), property, receiver);
  return flags & 2 && typeof result === "function" ? function (args) {
    return result.apply(receiver, args);
  } : result;
}

//# sourceMappingURL=superPropGet.js.map

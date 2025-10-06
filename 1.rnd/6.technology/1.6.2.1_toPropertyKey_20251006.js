"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toPropertyKey;
const _toPrimitive = require("./toPrimitive.js");
function toPropertyKey(arg) {
  const key = (0, _toPrimitive.default)(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}

//# sourceMappingURL=toPropertyKey.js.map

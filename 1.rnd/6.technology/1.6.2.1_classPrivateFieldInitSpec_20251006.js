"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _classPrivateFieldInitSpec;
const _checkPrivateRedeclaration = require("./checkPrivateRedeclaration.js");
function _classPrivateFieldInitSpec(obj, privateMap, value) {
  (0, _checkPrivateRedeclaration.default)(obj, privateMap);
  privateMap.set(obj, value);
}

//# sourceMappingURL=classPrivateFieldInitSpec.js.map

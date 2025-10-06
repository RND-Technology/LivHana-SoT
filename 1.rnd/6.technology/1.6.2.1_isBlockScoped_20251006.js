"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isBlockScoped;
const _index = require("./generated/index.js");
const _isLet = require("./isLet.js");
function isBlockScoped(node) {
  return (0, _index.isFunctionDeclaration)(node) || (0, _index.isClassDeclaration)(node) || (0, _isLet.default)(node);
}

//# sourceMappingURL=isBlockScoped.js.map

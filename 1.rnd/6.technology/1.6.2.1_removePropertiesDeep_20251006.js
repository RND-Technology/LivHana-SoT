"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = removePropertiesDeep;
const _traverseFast = require("../traverse/traverseFast.js");
const _removeProperties = require("./removeProperties.js");
function removePropertiesDeep(tree, opts) {
  (0, _traverseFast.default)(tree, _removeProperties.default, opts);
  return tree;
}

//# sourceMappingURL=removePropertiesDeep.js.map

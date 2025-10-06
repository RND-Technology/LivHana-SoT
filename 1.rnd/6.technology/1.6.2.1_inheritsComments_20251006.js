"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = inheritsComments;
const _inheritTrailingComments = require("./inheritTrailingComments.js");
const _inheritLeadingComments = require("./inheritLeadingComments.js");
const _inheritInnerComments = require("./inheritInnerComments.js");
function inheritsComments(child, parent) {
  (0, _inheritTrailingComments.default)(child, parent);
  (0, _inheritLeadingComments.default)(child, parent);
  (0, _inheritInnerComments.default)(child, parent);
  return child;
}

//# sourceMappingURL=inheritsComments.js.map

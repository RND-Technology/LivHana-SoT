"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _toArray;
const _arrayWithHoles = require("./arrayWithHoles.js");
const _iterableToArray = require("./iterableToArray.js");
const _unsupportedIterableToArray = require("./unsupportedIterableToArray.js");
const _nonIterableRest = require("./nonIterableRest.js");
function _toArray(arr) {
  return (0, _arrayWithHoles.default)(arr) || (0, _iterableToArray.default)(arr) || (0, _unsupportedIterableToArray.default)(arr) || (0, _nonIterableRest.default)();
}

//# sourceMappingURL=toArray.js.map

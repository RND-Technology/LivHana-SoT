"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = getWidth;

const _isWindow = _interopRequireDefault(require("./isWindow"));

const _offset = _interopRequireDefault(require("./offset"));

/**
 * Returns the width of a given element.
 * 
 * @param node the element
 * @param client whether to use `clientWidth` if possible
 */
function getWidth(node, client) {
  const win = (0, _isWindow.default)(node);
  return win ? win.innerWidth : client ? node.clientWidth : (0, _offset.default)(node).width;
}

module.exports = exports["default"];
"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = offsetParent;

const _css = _interopRequireDefault(require("./css"));

const _ownerDocument = _interopRequireDefault(require("./ownerDocument"));

const isHTMLElement = function isHTMLElement(e) {
  return !!e && 'offsetParent' in e;
};

function offsetParent(node) {
  const doc = (0, _ownerDocument.default)(node);
  let parent = node && node.offsetParent;

  while (isHTMLElement(parent) && parent.nodeName !== 'HTML' && (0, _css.default)(parent, 'position') === 'static') {
    parent = parent.offsetParent;
  }

  return parent || doc.documentElement;
}

module.exports = exports["default"];
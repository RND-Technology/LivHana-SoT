"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = scrollParent;

const _css = _interopRequireDefault(require("./css"));

const _height = _interopRequireDefault(require("./height"));

const _isDocument = _interopRequireDefault(require("./isDocument"));

/* eslint-disable no-cond-assign, no-continue */

/**
 * Find the first scrollable parent of an element.
 *
 * @param element Starting element
 * @param firstPossible Stop at the first scrollable parent, even if it's not currently scrollable
 */
function scrollParent(element, firstPossible) {
  const position = (0, _css.default)(element, 'position');
  const excludeStatic = position === 'absolute';
  const ownerDoc = element.ownerDocument;
  if (position === 'fixed') return ownerDoc || document; // @ts-ignore

  while ((element = element.parentNode) && !(0, _isDocument.default)(element)) {
    const isStatic = excludeStatic && (0, _css.default)(element, 'position') === 'static';
    const style = ((0, _css.default)(element, 'overflow') || '') + ((0, _css.default)(element, 'overflow-y') || '') + (0, _css.default)(element, 'overflow-x');
    if (isStatic) continue;

    if (/(auto|scroll)/.test(style) && (firstPossible || (0, _height.default)(element) < element.scrollHeight)) {
      return element;
    }
  }

  return ownerDoc || document;
}

module.exports = exports["default"];
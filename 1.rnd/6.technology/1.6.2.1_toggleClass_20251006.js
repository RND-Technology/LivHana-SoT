"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = toggleClass;

const _addClass = _interopRequireDefault(require("./addClass"));

const _hasClass = _interopRequireDefault(require("./hasClass"));

const _removeClass = _interopRequireDefault(require("./removeClass"));

/**
 * Toggles a CSS class on a given element.
 * 
 * @param element the element
 * @param className the CSS class name
 */
function toggleClass(element, className) {
  if (element.classList) element.classList.toggle(className);else if ((0, _hasClass.default)(element, className)) (0, _removeClass.default)(element, className);else (0, _addClass.default)(element, className);
}

module.exports = exports["default"];
"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = filterEvents;

const _contains = _interopRequireDefault(require("./contains"));

const _querySelectorAll = _interopRequireDefault(require("./querySelectorAll"));

function filterEvents(selector, handler) {
  return function filterHandler(e) {
    const top = e.currentTarget;
    const target = e.target;
    const matches = (0, _querySelectorAll.default)(top, selector);
    if (matches.some(function (match) {
      return (0, _contains.default)(match, target);
    })) handler.call(this, e);
  };
}

module.exports = exports["default"];
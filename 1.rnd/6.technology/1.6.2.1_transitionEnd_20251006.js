"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = transitionEnd;

const _css = _interopRequireDefault(require("./css"));

const _listen = _interopRequireDefault(require("./listen"));

const _triggerEvent = _interopRequireDefault(require("./triggerEvent"));

function parseDuration(node) {
  const str = (0, _css.default)(node, 'transitionDuration') || '';
  const mult = str.indexOf('ms') === -1 ? 1000 : 1;
  return parseFloat(str) * mult;
}

function emulateTransitionEnd(element, duration, padding) {
  if (padding === void 0) {
    padding = 5;
  }

  let called = false;
  const handle = setTimeout(function () {
    if (!called) (0, _triggerEvent.default)(element, 'transitionend', true);
  }, duration + padding);
  const remove = (0, _listen.default)(element, 'transitionend', function () {
    called = true;
  }, {
    once: true
  });
  return function () {
    clearTimeout(handle);
    remove();
  };
}

function transitionEnd(element, handler, duration, padding) {
  if (duration == null) duration = parseDuration(element) || 0;
  const removeEmulate = emulateTransitionEnd(element, duration, padding);
  const remove = (0, _listen.default)(element, 'transitionend', handler);
  return function () {
    removeEmulate();
    remove();
  };
}

module.exports = exports["default"];
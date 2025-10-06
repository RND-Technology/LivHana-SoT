"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = scrollTo;

const _animationFrame = require("./animationFrame");

const _height = _interopRequireDefault(require("./height"));

const _isWindow = _interopRequireDefault(require("./isWindow"));

const _offset = _interopRequireDefault(require("./offset"));

const _scrollParent = _interopRequireDefault(require("./scrollParent"));

const _scrollTop = _interopRequireDefault(require("./scrollTop"));

/* eslint-disable no-nested-ternary */
function scrollTo(selected, scrollParent) {
  let offset = (0, _offset.default)(selected);
  let poff = {
    top: 0,
    left: 0
  };
  if (!selected) return undefined;
  const list = scrollParent || (0, _scrollParent.default)(selected);
  const isWin = (0, _isWindow.default)(list);
  let listScrollTop = (0, _scrollTop.default)(list);
  const listHeight = (0, _height.default)(list, true);
  if (!isWin) poff = (0, _offset.default)(list);
  offset = {
    top: offset.top - poff.top,
    left: offset.left - poff.left,
    height: offset.height,
    width: offset.width
  };
  const selectedHeight = offset.height;
  const selectedTop = offset.top + (isWin ? 0 : listScrollTop);
  const bottom = selectedTop + selectedHeight;
  listScrollTop = listScrollTop > selectedTop ? selectedTop : bottom > listScrollTop + listHeight ? bottom - listHeight : listScrollTop;
  const id = (0, _animationFrame.request)(function () {
    return (0, _scrollTop.default)(list, listScrollTop);
  });
  return function () {
    return (0, _animationFrame.cancel)(id);
  };
}

module.exports = exports["default"];
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAngledTickWidth = getAngledTickWidth;
exports.getNumberIntervalTicks = getNumberIntervalTicks;
exports.getTickBoundaries = getTickBoundaries;
exports.isVisible = isVisible;
const _CartesianUtils = require("./CartesianUtils");
const _getEveryNthWithCondition = require("./getEveryNthWithCondition");
function getAngledTickWidth(contentSize, unitSize, angle) {
  const size = {
    width: contentSize.width + unitSize.width,
    height: contentSize.height + unitSize.height
  };
  return (0, _CartesianUtils.getAngledRectangleWidth)(size, angle);
}
function getTickBoundaries(viewBox, sign, sizeKey) {
  const isWidth = sizeKey === 'width';
  const {
    x,
    y,
    width,
    height
  } = viewBox;
  if (sign === 1) {
    return {
      start: isWidth ? x : y,
      end: isWidth ? x + width : y + height
    };
  }
  return {
    start: isWidth ? x + width : y + height,
    end: isWidth ? x : y
  };
}
function isVisible(sign, tickPosition, getSize, start, end) {
  /* Since getSize() is expensive (it reads the ticks' size from the DOM), we do this check first to avoid calculating
   * the tick's size. */
  if (sign * tickPosition < sign * start || sign * tickPosition > sign * end) {
    return false;
  }
  const size = getSize();
  return sign * (tickPosition - sign * size / 2 - start) >= 0 && sign * (tickPosition + sign * size / 2 - end) <= 0;
}
function getNumberIntervalTicks(ticks, interval) {
  return (0, _getEveryNthWithCondition.getEveryNthWithCondition)(ticks, interval + 1);
}
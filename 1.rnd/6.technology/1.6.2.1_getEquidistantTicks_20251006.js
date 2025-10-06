"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEquidistantTicks = getEquidistantTicks;
const _TickUtils = require("../util/TickUtils");
const _getEveryNthWithCondition = require("../util/getEveryNthWithCondition");
function getEquidistantTicks(sign, boundaries, getTickSize, ticks, minTickGap) {
  // If the ticks are readonly, then the slice might not be necessary
  const result = (ticks || []).slice();
  const {
    start: initialStart,
    end
  } = boundaries;
  let index = 0;
  // Premature optimisation idea 1: Estimate a lower bound, and start from there.
  // For now, start from every tick
  let stepsize = 1;
  let start = initialStart;
  let _loop = function _loop() {
      // Given stepsize, evaluate whether every stepsize-th tick can be shown.
      // If it can not, then increase the stepsize by 1, and try again.

      const entry = ticks === null || ticks === void 0 ? void 0 : ticks[index];

      // Break condition - If we have evaluated all the ticks, then we are done.
      if (entry === undefined) {
        return {
          v: (0, _getEveryNthWithCondition.getEveryNthWithCondition)(ticks, stepsize)
        };
      }

      // Check if the element collides with the next element
      const i = index;
      let size;
      const getSize = () => {
        if (size === undefined) {
          size = getTickSize(entry, i);
        }
        return size;
      };
      const tickCoord = entry.coordinate;
      // We will always show the first tick.
      const isShow = index === 0 || (0, _TickUtils.isVisible)(sign, tickCoord, getSize, start, end);
      if (!isShow) {
        // Start all over with a larger stepsize
        index = 0;
        start = initialStart;
        stepsize += 1;
      }
      if (isShow) {
        // If it can be shown, update the start
        start = tickCoord + sign * (getSize() / 2 + minTickGap);
        index += stepsize;
      }
    },
    _ret;
  while (stepsize <= result.length) {
    _ret = _loop();
    if (_ret) return _ret.v;
  }
  return [];
}
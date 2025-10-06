"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.combineAxisRangeWithReverse = void 0;
const combineAxisRangeWithReverse = (axisSettings, axisRange) => {
  if (!axisSettings || !axisRange) {
    return undefined;
  }
  if (axisSettings !== null && axisSettings !== void 0 && axisSettings.reversed) {
    return [axisRange[1], axisRange[0]];
  }
  return axisRange;
};
exports.combineAxisRangeWithReverse = combineAxisRangeWithReverse;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectChartOffset = void 0;
const _reselect = require("reselect");
const _selectChartOffsetInternal = require("./selectChartOffsetInternal");
const selectChartOffset = exports.selectChartOffset = (0, _reselect.createSelector)([_selectChartOffsetInternal.selectChartOffsetInternal], offsetInternal => {
  if (!offsetInternal) {
    return undefined;
  }
  return {
    top: offsetInternal.top,
    bottom: offsetInternal.bottom,
    left: offsetInternal.left,
    right: offsetInternal.right
  };
});
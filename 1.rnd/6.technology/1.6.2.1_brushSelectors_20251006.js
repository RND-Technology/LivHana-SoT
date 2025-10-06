"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectBrushSettings = exports.selectBrushDimensions = void 0;
const _reselect = require("reselect");
const _selectChartOffsetInternal = require("./selectChartOffsetInternal");
const _containerSelectors = require("./containerSelectors");
const _DataUtils = require("../../util/DataUtils");
const selectBrushSettings = state => state.brush;
exports.selectBrushSettings = selectBrushSettings;
const selectBrushDimensions = exports.selectBrushDimensions = (0, _reselect.createSelector)([selectBrushSettings, _selectChartOffsetInternal.selectChartOffsetInternal, _containerSelectors.selectMargin], (brushSettings, offset, margin) => ({
  height: brushSettings.height,
  x: (0, _DataUtils.isNumber)(brushSettings.x) ? brushSettings.x : offset.left,
  y: (0, _DataUtils.isNumber)(brushSettings.y) ? brushSettings.y : offset.top + offset.height + offset.brushBottom - ((margin === null || margin === void 0 ? void 0 : margin.bottom) || 0),
  width: (0, _DataUtils.isNumber)(brushSettings.width) ? brushSettings.width : offset.width
}));
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectMargin = exports.selectContainerScale = exports.selectChartWidth = exports.selectChartHeight = void 0;
const selectChartWidth = state => state.layout.width;
exports.selectChartWidth = selectChartWidth;
const selectChartHeight = state => state.layout.height;
exports.selectChartHeight = selectChartHeight;
const selectContainerScale = state => state.layout.scale;
exports.selectContainerScale = selectContainerScale;
const selectMargin = state => state.layout.margin;
exports.selectMargin = selectMargin;
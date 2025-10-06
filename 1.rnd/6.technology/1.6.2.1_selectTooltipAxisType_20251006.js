"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectTooltipAxisType = void 0;
const _chartLayoutContext = require("../../context/chartLayoutContext");
const selectTooltipAxisType = state => {
  const layout = (0, _chartLayoutContext.selectChartLayout)(state);
  if (layout === 'horizontal') {
    return 'xAxis';
  }
  if (layout === 'vertical') {
    return 'yAxis';
  }
  if (layout === 'centric') {
    return 'angleAxis';
  }
  return 'radiusAxis';
};
exports.selectTooltipAxisType = selectTooltipAxisType;
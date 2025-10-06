"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectActivePropsFromChartPointer = void 0;
const _reselect = require("reselect");
const _chartLayoutContext = require("../../context/chartLayoutContext");
const _tooltipSelectors = require("./tooltipSelectors");
const _selectChartOffsetInternal = require("./selectChartOffsetInternal");
const _selectors = require("./selectors");
const _polarAxisSelectors = require("./polarAxisSelectors");
const _selectTooltipAxisType = require("./selectTooltipAxisType");
const pickChartPointer = (_state, chartPointer) => chartPointer;
const selectActivePropsFromChartPointer = exports.selectActivePropsFromChartPointer = (0, _reselect.createSelector)([pickChartPointer, _chartLayoutContext.selectChartLayout, _polarAxisSelectors.selectPolarViewBox, _selectTooltipAxisType.selectTooltipAxisType, _tooltipSelectors.selectTooltipAxisRangeWithReverse, _tooltipSelectors.selectTooltipAxisTicks, _selectors.selectOrderedTooltipTicks, _selectChartOffsetInternal.selectChartOffsetInternal], _selectors.combineActiveProps);
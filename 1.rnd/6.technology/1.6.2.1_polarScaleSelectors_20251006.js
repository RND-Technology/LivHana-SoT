"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectPolarGraphicalItemAxisTicks = exports.selectPolarCategoricalDomain = exports.selectPolarAxisTicks = exports.selectPolarAxisScale = exports.selectPolarAxis = void 0;
const _reselect = require("reselect");
const _axisSelectors = require("./axisSelectors");
const _polarAxisSelectors = require("./polarAxisSelectors");
const _chartLayoutContext = require("../../context/chartLayoutContext");
const _polarSelectors = require("./polarSelectors");
const _pickAxisType = require("./pickAxisType");
const selectPolarAxis = (state, axisType, axisId) => {
  switch (axisType) {
    case 'angleAxis':
      {
        return (0, _polarAxisSelectors.selectAngleAxis)(state, axisId);
      }
    case 'radiusAxis':
      {
        return (0, _polarAxisSelectors.selectRadiusAxis)(state, axisId);
      }
    default:
      {
        throw new Error("Unexpected axis type: ".concat(axisType));
      }
  }
};
exports.selectPolarAxis = selectPolarAxis;
const selectPolarAxisRangeWithReversed = (state, axisType, axisId) => {
  switch (axisType) {
    case 'angleAxis':
      {
        return (0, _polarAxisSelectors.selectAngleAxisRangeWithReversed)(state, axisId);
      }
    case 'radiusAxis':
      {
        return (0, _polarAxisSelectors.selectRadiusAxisRangeWithReversed)(state, axisId);
      }
    default:
      {
        throw new Error("Unexpected axis type: ".concat(axisType));
      }
  }
};
const selectPolarAxisScale = exports.selectPolarAxisScale = (0, _reselect.createSelector)([selectPolarAxis, _axisSelectors.selectRealScaleType, _polarSelectors.selectPolarAxisDomainIncludingNiceTicks, selectPolarAxisRangeWithReversed], _axisSelectors.combineScaleFunction);
const selectPolarCategoricalDomain = exports.selectPolarCategoricalDomain = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, _polarSelectors.selectPolarAppliedValues, _axisSelectors.selectAxisSettings, _pickAxisType.pickAxisType], _axisSelectors.combineCategoricalDomain);
const selectPolarAxisTicks = exports.selectPolarAxisTicks = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, selectPolarAxis, _axisSelectors.selectRealScaleType, selectPolarAxisScale, _polarSelectors.selectPolarNiceTicks, selectPolarAxisRangeWithReversed, _axisSelectors.selectDuplicateDomain, selectPolarCategoricalDomain, _pickAxisType.pickAxisType], _axisSelectors.combineAxisTicks);
const selectPolarGraphicalItemAxisTicks = exports.selectPolarGraphicalItemAxisTicks = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, selectPolarAxis, selectPolarAxisScale, selectPolarAxisRangeWithReversed, _axisSelectors.selectDuplicateDomain, selectPolarCategoricalDomain, _pickAxisType.pickAxisType], _axisSelectors.combineGraphicalItemTicks);
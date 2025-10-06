"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectRadiusAxisRangeWithReversed = exports.selectRadiusAxisRange = exports.selectRadiusAxis = exports.selectPolarViewBox = exports.selectPolarOptions = exports.selectOuterRadius = exports.selectMaxRadius = exports.selectAngleAxisRangeWithReversed = exports.selectAngleAxisRange = exports.selectAngleAxis = exports.implicitRadiusAxis = exports.implicitRadialBarRadiusAxis = exports.implicitRadialBarAngleAxis = exports.implicitAngleAxis = void 0;
const _reselect = require("reselect");
const _containerSelectors = require("./containerSelectors");
const _selectChartOffsetInternal = require("./selectChartOffsetInternal");
const _PolarUtils = require("../../util/PolarUtils");
const _DataUtils = require("../../util/DataUtils");
const _defaultPolarAngleAxisProps = require("../../polar/defaultPolarAngleAxisProps");
const _defaultPolarRadiusAxisProps = require("../../polar/defaultPolarRadiusAxisProps");
const _combineAxisRangeWithReverse = require("./combiners/combineAxisRangeWithReverse");
const _chartLayoutContext = require("../../context/chartLayoutContext");
const implicitAngleAxis = exports.implicitAngleAxis = {
  allowDataOverflow: false,
  allowDecimals: false,
  allowDuplicatedCategory: false,
  // defaultPolarAngleAxisProps.allowDuplicatedCategory has it set to true but the actual axis rendering ignores the prop because reasons,
  dataKey: undefined,
  domain: undefined,
  id: _defaultPolarAngleAxisProps.defaultPolarAngleAxisProps.angleAxisId,
  includeHidden: false,
  name: undefined,
  reversed: _defaultPolarAngleAxisProps.defaultPolarAngleAxisProps.reversed,
  scale: _defaultPolarAngleAxisProps.defaultPolarAngleAxisProps.scale,
  tick: _defaultPolarAngleAxisProps.defaultPolarAngleAxisProps.tick,
  tickCount: undefined,
  ticks: undefined,
  type: _defaultPolarAngleAxisProps.defaultPolarAngleAxisProps.type,
  unit: undefined
};
const implicitRadiusAxis = exports.implicitRadiusAxis = {
  allowDataOverflow: _defaultPolarRadiusAxisProps.defaultPolarRadiusAxisProps.allowDataOverflow,
  allowDecimals: false,
  allowDuplicatedCategory: _defaultPolarRadiusAxisProps.defaultPolarRadiusAxisProps.allowDuplicatedCategory,
  dataKey: undefined,
  domain: undefined,
  id: _defaultPolarRadiusAxisProps.defaultPolarRadiusAxisProps.radiusAxisId,
  includeHidden: false,
  name: undefined,
  reversed: false,
  scale: _defaultPolarRadiusAxisProps.defaultPolarRadiusAxisProps.scale,
  tick: _defaultPolarRadiusAxisProps.defaultPolarRadiusAxisProps.tick,
  tickCount: _defaultPolarRadiusAxisProps.defaultPolarRadiusAxisProps.tickCount,
  ticks: undefined,
  type: _defaultPolarRadiusAxisProps.defaultPolarRadiusAxisProps.type,
  unit: undefined
};
const implicitRadialBarAngleAxis = exports.implicitRadialBarAngleAxis = {
  allowDataOverflow: false,
  allowDecimals: false,
  allowDuplicatedCategory: _defaultPolarAngleAxisProps.defaultPolarAngleAxisProps.allowDuplicatedCategory,
  dataKey: undefined,
  domain: undefined,
  id: _defaultPolarAngleAxisProps.defaultPolarAngleAxisProps.angleAxisId,
  includeHidden: false,
  name: undefined,
  reversed: false,
  scale: _defaultPolarAngleAxisProps.defaultPolarAngleAxisProps.scale,
  tick: _defaultPolarAngleAxisProps.defaultPolarAngleAxisProps.tick,
  tickCount: undefined,
  ticks: undefined,
  type: 'number',
  unit: undefined
};
const implicitRadialBarRadiusAxis = exports.implicitRadialBarRadiusAxis = {
  allowDataOverflow: _defaultPolarRadiusAxisProps.defaultPolarRadiusAxisProps.allowDataOverflow,
  allowDecimals: false,
  allowDuplicatedCategory: _defaultPolarRadiusAxisProps.defaultPolarRadiusAxisProps.allowDuplicatedCategory,
  dataKey: undefined,
  domain: undefined,
  id: _defaultPolarRadiusAxisProps.defaultPolarRadiusAxisProps.radiusAxisId,
  includeHidden: false,
  name: undefined,
  reversed: false,
  scale: _defaultPolarRadiusAxisProps.defaultPolarRadiusAxisProps.scale,
  tick: _defaultPolarRadiusAxisProps.defaultPolarRadiusAxisProps.tick,
  tickCount: _defaultPolarRadiusAxisProps.defaultPolarRadiusAxisProps.tickCount,
  ticks: undefined,
  type: 'category',
  unit: undefined
};
const selectAngleAxis = (state, angleAxisId) => {
  if (state.polarAxis.angleAxis[angleAxisId] != null) {
    return state.polarAxis.angleAxis[angleAxisId];
  }
  if (state.layout.layoutType === 'radial') {
    return implicitRadialBarAngleAxis;
  }
  return implicitAngleAxis;
};
exports.selectAngleAxis = selectAngleAxis;
const selectRadiusAxis = (state, radiusAxisId) => {
  if (state.polarAxis.radiusAxis[radiusAxisId] != null) {
    return state.polarAxis.radiusAxis[radiusAxisId];
  }
  if (state.layout.layoutType === 'radial') {
    return implicitRadialBarRadiusAxis;
  }
  return implicitRadiusAxis;
};
exports.selectRadiusAxis = selectRadiusAxis;
const selectPolarOptions = state => state.polarOptions;
exports.selectPolarOptions = selectPolarOptions;
const selectMaxRadius = exports.selectMaxRadius = (0, _reselect.createSelector)([_containerSelectors.selectChartWidth, _containerSelectors.selectChartHeight, _selectChartOffsetInternal.selectChartOffsetInternal], _PolarUtils.getMaxRadius);
const selectInnerRadius = (0, _reselect.createSelector)([selectPolarOptions, selectMaxRadius], (polarChartOptions, maxRadius) => {
  if (polarChartOptions == null) {
    return undefined;
  }
  return (0, _DataUtils.getPercentValue)(polarChartOptions.innerRadius, maxRadius, 0);
});
const selectOuterRadius = exports.selectOuterRadius = (0, _reselect.createSelector)([selectPolarOptions, selectMaxRadius], (polarChartOptions, maxRadius) => {
  if (polarChartOptions == null) {
    return undefined;
  }
  return (0, _DataUtils.getPercentValue)(polarChartOptions.outerRadius, maxRadius, maxRadius * 0.8);
});
const combineAngleAxisRange = polarOptions => {
  if (polarOptions == null) {
    return [0, 0];
  }
  const {
    startAngle,
    endAngle
  } = polarOptions;
  return [startAngle, endAngle];
};
const selectAngleAxisRange = exports.selectAngleAxisRange = (0, _reselect.createSelector)([selectPolarOptions], combineAngleAxisRange);
const selectAngleAxisRangeWithReversed = exports.selectAngleAxisRangeWithReversed = (0, _reselect.createSelector)([selectAngleAxis, selectAngleAxisRange], _combineAxisRangeWithReverse.combineAxisRangeWithReverse);
const selectRadiusAxisRange = exports.selectRadiusAxisRange = (0, _reselect.createSelector)([selectMaxRadius, selectInnerRadius, selectOuterRadius], (maxRadius, innerRadius, outerRadius) => {
  if (maxRadius == null || innerRadius == null || outerRadius == null) {
    return undefined;
  }
  return [innerRadius, outerRadius];
});
const selectRadiusAxisRangeWithReversed = exports.selectRadiusAxisRangeWithReversed = (0, _reselect.createSelector)([selectRadiusAxis, selectRadiusAxisRange], _combineAxisRangeWithReverse.combineAxisRangeWithReverse);
const selectPolarViewBox = exports.selectPolarViewBox = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, selectPolarOptions, selectInnerRadius, selectOuterRadius, _containerSelectors.selectChartWidth, _containerSelectors.selectChartHeight], (layout, polarOptions, innerRadius, outerRadius, width, height) => {
  if (layout !== 'centric' && layout !== 'radial' || polarOptions == null || innerRadius == null || outerRadius == null) {
    return undefined;
  }
  const {
    cx,
    cy,
    startAngle,
    endAngle
  } = polarOptions;
  return {
    cx: (0, _DataUtils.getPercentValue)(cx, width, width / 2),
    cy: (0, _DataUtils.getPercentValue)(cy, height, height / 2),
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    clockWise: false // this property look useful, why not use it?
  };
});
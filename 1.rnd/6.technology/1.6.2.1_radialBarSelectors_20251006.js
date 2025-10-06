"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectRadiusAxisWithScale = exports.selectRadiusAxisTicks = exports.selectRadialBarSectors = exports.selectRadialBarLegendPayload = exports.selectPolarBarSizeList = exports.selectPolarBarPosition = exports.selectPolarBarBandSize = exports.selectBaseValue = exports.selectBandSizeOfPolarAxis = exports.selectAngleAxisWithScale = exports.selectAllPolarBarPositions = exports.pickMaxBarSize = void 0;
const _reselect = require("reselect");
const _RadialBar = require("../../polar/RadialBar");
const _dataSelectors = require("./dataSelectors");
const _polarScaleSelectors = require("./polarScaleSelectors");
const _axisSelectors = require("./axisSelectors");
const _polarAxisSelectors = require("./polarAxisSelectors");
const _chartLayoutContext = require("../../context/chartLayoutContext");
const _ChartUtils = require("../../util/ChartUtils");
const _barSelectors = require("./barSelectors");
const _rootPropsSelectors = require("./rootPropsSelectors");
const _polarSelectors = require("./polarSelectors");
const _DataUtils = require("../../util/DataUtils");
const _combineDisplayedStackedData = require("./combiners/combineDisplayedStackedData");
const _selectTooltipAxis = require("./selectTooltipAxis");
const _StackedGraphicalItem = require("../types/StackedGraphicalItem");
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const selectRadiusAxisForRadialBar = (state, radiusAxisId) => (0, _polarAxisSelectors.selectRadiusAxis)(state, radiusAxisId);
const selectRadiusAxisScaleForRadar = (state, radiusAxisId) => (0, _polarScaleSelectors.selectPolarAxisScale)(state, 'radiusAxis', radiusAxisId);
const selectRadiusAxisWithScale = exports.selectRadiusAxisWithScale = (0, _reselect.createSelector)([selectRadiusAxisForRadialBar, selectRadiusAxisScaleForRadar], (axis, scale) => {
  if (axis == null || scale == null) {
    return undefined;
  }
  return _objectSpread(_objectSpread({}, axis), {}, {
    scale
  });
});
const selectRadiusAxisTicks = (state, radiusAxisId, _angleAxisId, isPanorama) => {
  return (0, _polarScaleSelectors.selectPolarGraphicalItemAxisTicks)(state, 'radiusAxis', radiusAxisId, isPanorama);
};
exports.selectRadiusAxisTicks = selectRadiusAxisTicks;
const selectAngleAxisForRadialBar = (state, _radiusAxisId, angleAxisId) => (0, _polarAxisSelectors.selectAngleAxis)(state, angleAxisId);
const selectAngleAxisScaleForRadialBar = (state, _radiusAxisId, angleAxisId) => (0, _polarScaleSelectors.selectPolarAxisScale)(state, 'angleAxis', angleAxisId);
const selectAngleAxisWithScale = exports.selectAngleAxisWithScale = (0, _reselect.createSelector)([selectAngleAxisForRadialBar, selectAngleAxisScaleForRadialBar], (axis, scale) => {
  if (axis == null || scale == null) {
    return undefined;
  }
  return _objectSpread(_objectSpread({}, axis), {}, {
    scale
  });
});
const selectAngleAxisTicks = (state, _radiusAxisId, angleAxisId, isPanorama) => {
  return (0, _polarScaleSelectors.selectPolarAxisTicks)(state, 'angleAxis', angleAxisId, isPanorama);
};
const pickRadialBarSettings = (_state, _radiusAxisId, _angleAxisId, radialBarSettings) => radialBarSettings;
const selectSynchronisedRadialBarSettings = (0, _reselect.createSelector)([_polarSelectors.selectUnfilteredPolarItems, pickRadialBarSettings], (graphicalItems, radialBarSettingsFromProps) => {
  if (graphicalItems.some(pgis => pgis.type === 'radialBar' && radialBarSettingsFromProps.dataKey === pgis.dataKey && radialBarSettingsFromProps.stackId === pgis.stackId)) {
    return radialBarSettingsFromProps;
  }
  return undefined;
});
const selectBandSizeOfPolarAxis = exports.selectBandSizeOfPolarAxis = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, selectRadiusAxisWithScale, selectRadiusAxisTicks, selectAngleAxisWithScale, selectAngleAxisTicks], (layout, radiusAxis, radiusAxisTicks, angleAxis, angleAxisTicks) => {
  if ((0, _ChartUtils.isCategoricalAxis)(layout, 'radiusAxis')) {
    return (0, _ChartUtils.getBandSizeOfAxis)(radiusAxis, radiusAxisTicks, false);
  }
  return (0, _ChartUtils.getBandSizeOfAxis)(angleAxis, angleAxisTicks, false);
});
const selectBaseValue = exports.selectBaseValue = (0, _reselect.createSelector)([selectAngleAxisWithScale, selectRadiusAxisWithScale, _chartLayoutContext.selectChartLayout], (angleAxis, radiusAxis, layout) => {
  const numericAxis = layout === 'radial' ? angleAxis : radiusAxis;
  if (numericAxis == null || numericAxis.scale == null) {
    return undefined;
  }
  return (0, _ChartUtils.getBaseValueOfBar)({
    numericAxis
  });
});
const pickCells = (_state, _radiusAxisId, _angleAxisId, _radialBarSettings, cells) => cells;
const pickAngleAxisId = (_state, _radiusAxisId, angleAxisId, _radialBarSettings, _cells) => angleAxisId;
const pickRadiusAxisId = (_state, radiusAxisId, _angleAxisId, _radialBarSettings, _cells) => radiusAxisId;
const pickMaxBarSize = (_state, _radiusAxisId, _angleAxisId, radialBarSettings, _cells) => radialBarSettings.maxBarSize;
exports.pickMaxBarSize = pickMaxBarSize;
const selectAllVisibleRadialBars = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, _polarSelectors.selectUnfilteredPolarItems, pickAngleAxisId, pickRadiusAxisId], (layout, allItems, angleAxisId, radiusAxisId) => {
  return allItems.filter(i => {
    if (layout === 'centric') {
      return i.angleAxisId === angleAxisId;
    }
    return i.radiusAxisId === radiusAxisId;
  }).filter(i => i.hide === false).filter(i => i.type === 'radialBar');
});

/**
 * The generator never returned the totalSize which means that barSize in polar chart can not support percent values.
 * We can add that if we want to I suppose.
 * @returns undefined - but it should be a total size of numerical axis in polar chart
 */
const selectPolarBarAxisSize = () => undefined;
const selectPolarBarSizeList = exports.selectPolarBarSizeList = (0, _reselect.createSelector)([selectAllVisibleRadialBars, _rootPropsSelectors.selectRootBarSize, selectPolarBarAxisSize], _barSelectors.combineBarSizeList);
const selectPolarBarBandSize = exports.selectPolarBarBandSize = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, _rootPropsSelectors.selectRootMaxBarSize, selectAngleAxisWithScale, selectAngleAxisTicks, selectRadiusAxisWithScale, selectRadiusAxisTicks, pickMaxBarSize], (layout, globalMaxBarSize, angleAxis, angleAxisTicks, radiusAxis, radiusAxisTicks, childMaxBarSize) => {
  let _ref2, _getBandSizeOfAxis2;
  const maxBarSize = (0, _DataUtils.isNullish)(childMaxBarSize) ? globalMaxBarSize : childMaxBarSize;
  if (layout === 'centric') {
    let _ref, _getBandSizeOfAxis;
    return (_ref = (_getBandSizeOfAxis = (0, _ChartUtils.getBandSizeOfAxis)(angleAxis, angleAxisTicks, true)) !== null && _getBandSizeOfAxis !== void 0 ? _getBandSizeOfAxis : maxBarSize) !== null && _ref !== void 0 ? _ref : 0;
  }
  return (_ref2 = (_getBandSizeOfAxis2 = (0, _ChartUtils.getBandSizeOfAxis)(radiusAxis, radiusAxisTicks, true)) !== null && _getBandSizeOfAxis2 !== void 0 ? _getBandSizeOfAxis2 : maxBarSize) !== null && _ref2 !== void 0 ? _ref2 : 0;
});
const selectAllPolarBarPositions = exports.selectAllPolarBarPositions = (0, _reselect.createSelector)([selectPolarBarSizeList, _rootPropsSelectors.selectRootMaxBarSize, _rootPropsSelectors.selectBarGap, _rootPropsSelectors.selectBarCategoryGap, selectPolarBarBandSize, selectBandSizeOfPolarAxis, pickMaxBarSize], _barSelectors.combineAllBarPositions);
const selectPolarBarPosition = exports.selectPolarBarPosition = (0, _reselect.createSelector)([selectAllPolarBarPositions, selectSynchronisedRadialBarSettings], (allBarPositions, barSettings) => {
  if (allBarPositions == null || barSettings == null) {
    return undefined;
  }
  const position = allBarPositions.find(p => p.stackId === barSettings.stackId && barSettings.dataKey != null && p.dataKeys.includes(barSettings.dataKey));
  if (position == null) {
    return undefined;
  }
  return position.position;
});
const selectStackedRadialBars = (0, _reselect.createSelector)([_polarSelectors.selectPolarItemsSettings], allPolarItems => allPolarItems.filter(item => item.type === 'radialBar').filter(_StackedGraphicalItem.isStacked));
const selectPolarCombinedStackedData = (0, _reselect.createSelector)([selectStackedRadialBars, _dataSelectors.selectChartDataAndAlwaysIgnoreIndexes, _selectTooltipAxis.selectTooltipAxis], _combineDisplayedStackedData.combineDisplayedStackedData);
const selectStackGroups = (0, _reselect.createSelector)([selectPolarCombinedStackedData, selectStackedRadialBars, _rootPropsSelectors.selectStackOffsetType], _axisSelectors.combineStackGroups);
const selectRadialBarStackGroups = (state, radiusAxisId, angleAxisId) => {
  const layout = (0, _chartLayoutContext.selectChartLayout)(state);
  if (layout === 'centric') {
    return selectStackGroups(state, 'radiusAxis', radiusAxisId);
  }
  return selectStackGroups(state, 'angleAxis', angleAxisId);
};
const selectPolarStackedData = (0, _reselect.createSelector)([selectRadialBarStackGroups, selectSynchronisedRadialBarSettings], _barSelectors.combineStackedData);
const selectRadialBarSectors = exports.selectRadialBarSectors = (0, _reselect.createSelector)([selectAngleAxisWithScale, selectAngleAxisTicks, selectRadiusAxisWithScale, selectRadiusAxisTicks, _dataSelectors.selectChartDataWithIndexes, selectSynchronisedRadialBarSettings, selectBandSizeOfPolarAxis, _chartLayoutContext.selectChartLayout, selectBaseValue, _polarAxisSelectors.selectPolarViewBox, pickCells, selectPolarBarPosition, selectPolarStackedData], (angleAxis, angleAxisTicks, radiusAxis, radiusAxisTicks, _ref3, radialBarSettings, bandSize, layout, baseValue, polarViewBox, cells, pos, stackedData) => {
  const {
    chartData,
    dataStartIndex,
    dataEndIndex
  } = _ref3;
  if (radialBarSettings == null || radiusAxis == null || angleAxis == null || chartData == null || bandSize == null || pos == null || layout !== 'centric' && layout !== 'radial' || radiusAxisTicks == null) {
    return [];
  }
  const {
    dataKey,
    minPointSize
  } = radialBarSettings;
  const {
    cx,
    cy,
    startAngle,
    endAngle
  } = polarViewBox;
  const displayedData = chartData.slice(dataStartIndex, dataEndIndex + 1);
  const numericAxis = layout === 'centric' ? radiusAxis : angleAxis;
  const stackedDomain = stackedData ? numericAxis.scale.domain() : null;
  return (0, _RadialBar.computeRadialBarDataItems)({
    angleAxis,
    angleAxisTicks,
    bandSize,
    baseValue,
    cells,
    cx,
    cy,
    dataKey,
    dataStartIndex,
    displayedData,
    endAngle,
    layout,
    minPointSize,
    pos,
    radiusAxis,
    radiusAxisTicks,
    stackedData,
    stackedDomain,
    startAngle
  });
});
const selectRadialBarLegendPayload = exports.selectRadialBarLegendPayload = (0, _reselect.createSelector)([_dataSelectors.selectChartDataAndAlwaysIgnoreIndexes, (_s, l) => l], (_ref4, legendType) => {
  const {
    chartData,
    dataStartIndex,
    dataEndIndex
  } = _ref4;
  if (chartData == null) {
    return [];
  }
  const displayedData = chartData.slice(dataStartIndex, dataEndIndex + 1);
  if (displayedData.length === 0) {
    return [];
  }
  return displayedData.map(entry => {
    return {
      type: legendType,
      // @ts-expect-error we need a better typing for our data inputs
      value: entry.name,
      // @ts-expect-error we need a better typing for our data inputs
      color: entry.fill,
      payload: entry
    };
  });
});
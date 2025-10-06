"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectRadiusAxisForBandSize = exports.selectRadarPoints = exports.selectAngleAxisWithScaleAndViewport = exports.selectAngleAxisForBandSize = void 0;
const _reselect = require("reselect");
const _Radar = require("../../polar/Radar");
const _polarScaleSelectors = require("./polarScaleSelectors");
const _polarAxisSelectors = require("./polarAxisSelectors");
const _dataSelectors = require("./dataSelectors");
const _chartLayoutContext = require("../../context/chartLayoutContext");
const _ChartUtils = require("../../util/ChartUtils");
const _polarSelectors = require("./polarSelectors");
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const selectRadiusAxisScale = (state, radiusAxisId) => (0, _polarScaleSelectors.selectPolarAxisScale)(state, 'radiusAxis', radiusAxisId);
const selectRadiusAxisForRadar = (0, _reselect.createSelector)([selectRadiusAxisScale], scale => {
  if (scale == null) {
    return undefined;
  }
  return {
    scale
  };
});
const selectRadiusAxisForBandSize = exports.selectRadiusAxisForBandSize = (0, _reselect.createSelector)([_polarAxisSelectors.selectRadiusAxis, selectRadiusAxisScale], (axisSettings, scale) => {
  if (axisSettings == null || scale == null) {
    return undefined;
  }
  return _objectSpread(_objectSpread({}, axisSettings), {}, {
    scale
  });
});
const selectRadiusAxisTicks = (state, radiusAxisId, _angleAxisId, isPanorama) => {
  return (0, _polarScaleSelectors.selectPolarAxisTicks)(state, 'radiusAxis', radiusAxisId, isPanorama);
};
const selectAngleAxisForRadar = (state, _radiusAxisId, angleAxisId) => (0, _polarAxisSelectors.selectAngleAxis)(state, angleAxisId);
const selectPolarAxisScaleForRadar = (state, _radiusAxisId, angleAxisId) => (0, _polarScaleSelectors.selectPolarAxisScale)(state, 'angleAxis', angleAxisId);
const selectAngleAxisForBandSize = exports.selectAngleAxisForBandSize = (0, _reselect.createSelector)([selectAngleAxisForRadar, selectPolarAxisScaleForRadar], (axisSettings, scale) => {
  if (axisSettings == null || scale == null) {
    return undefined;
  }
  return _objectSpread(_objectSpread({}, axisSettings), {}, {
    scale
  });
});
const selectAngleAxisTicks = (state, _radiusAxisId, angleAxisId, isPanorama) => {
  return (0, _polarScaleSelectors.selectPolarAxisTicks)(state, 'angleAxis', angleAxisId, isPanorama);
};
const selectAngleAxisWithScaleAndViewport = exports.selectAngleAxisWithScaleAndViewport = (0, _reselect.createSelector)([selectAngleAxisForRadar, selectPolarAxisScaleForRadar, _polarAxisSelectors.selectPolarViewBox], (axisOptions, scale, polarViewBox) => {
  if (polarViewBox == null || scale == null) {
    return undefined;
  }
  return {
    scale,
    type: axisOptions.type,
    dataKey: axisOptions.dataKey,
    cx: polarViewBox.cx,
    cy: polarViewBox.cy
  };
});
const pickId = (_state, _radiusAxisId, _angleAxisId, _isPanorama, radarId) => radarId;
const selectBandSizeOfAxis = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, selectRadiusAxisForBandSize, selectRadiusAxisTicks, selectAngleAxisForBandSize, selectAngleAxisTicks], (layout, radiusAxis, radiusAxisTicks, angleAxis, angleAxisTicks) => {
  if ((0, _ChartUtils.isCategoricalAxis)(layout, 'radiusAxis')) {
    return (0, _ChartUtils.getBandSizeOfAxis)(radiusAxis, radiusAxisTicks, false);
  }
  return (0, _ChartUtils.getBandSizeOfAxis)(angleAxis, angleAxisTicks, false);
});
const selectSynchronisedRadarDataKey = (0, _reselect.createSelector)([_polarSelectors.selectUnfilteredPolarItems, pickId], (graphicalItems, radarId) => {
  if (graphicalItems == null) {
    return undefined;
  }
  // Find the radar item with the given radarId
  const pgis = graphicalItems.find(item => item.type === 'radar' && radarId === item.id);
  // If found, return its dataKey
  return pgis === null || pgis === void 0 ? void 0 : pgis.dataKey;
});
const selectRadarPoints = exports.selectRadarPoints = (0, _reselect.createSelector)([selectRadiusAxisForRadar, selectAngleAxisWithScaleAndViewport, _dataSelectors.selectChartDataAndAlwaysIgnoreIndexes, selectSynchronisedRadarDataKey, selectBandSizeOfAxis], (radiusAxis, angleAxis, _ref, dataKey, bandSize) => {
  const {
    chartData,
    dataStartIndex,
    dataEndIndex
  } = _ref;
  if (radiusAxis == null || angleAxis == null || chartData == null || bandSize == null || dataKey == null) {
    return undefined;
  }
  const displayedData = chartData.slice(dataStartIndex, dataEndIndex + 1);
  return (0, _Radar.computeRadarPoints)({
    radiusAxis,
    angleAxis,
    displayedData,
    dataKey,
    bandSize
  });
});
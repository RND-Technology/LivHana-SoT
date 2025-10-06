"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectChartViewBox = exports.selectChartOffsetInternal = exports.selectBrushHeight = exports.selectAxisViewBox = void 0;
const _reselect = require("reselect");
const _legendSelectors = require("./legendSelectors");
const _ChartUtils = require("../../util/ChartUtils");
const _containerSelectors = require("./containerSelectors");
const _selectAllAxes = require("./selectAllAxes");
const _Constants = require("../../util/Constants");
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const selectBrushHeight = state => state.brush.height;
exports.selectBrushHeight = selectBrushHeight;
function selectLeftAxesOffset(state) {
  const yAxes = (0, _selectAllAxes.selectAllYAxes)(state);
  return yAxes.reduce((result, entry) => {
    if (entry.orientation === 'left' && !entry.mirror && !entry.hide) {
      const width = typeof entry.width === 'number' ? entry.width : _Constants.DEFAULT_Y_AXIS_WIDTH;
      return result + width;
    }
    return result;
  }, 0);
}
function selectRightAxesOffset(state) {
  const yAxes = (0, _selectAllAxes.selectAllYAxes)(state);
  return yAxes.reduce((result, entry) => {
    if (entry.orientation === 'right' && !entry.mirror && !entry.hide) {
      const width = typeof entry.width === 'number' ? entry.width : _Constants.DEFAULT_Y_AXIS_WIDTH;
      return result + width;
    }
    return result;
  }, 0);
}
function selectTopAxesOffset(state) {
  const xAxes = (0, _selectAllAxes.selectAllXAxes)(state);
  return xAxes.reduce((result, entry) => {
    if (entry.orientation === 'top' && !entry.mirror && !entry.hide) {
      return result + entry.height;
    }
    return result;
  }, 0);
}
function selectBottomAxesOffset(state) {
  const xAxes = (0, _selectAllAxes.selectAllXAxes)(state);
  return xAxes.reduce((result, entry) => {
    if (entry.orientation === 'bottom' && !entry.mirror && !entry.hide) {
      return result + entry.height;
    }
    return result;
  }, 0);
}

/**
 * For internal use only.
 *
 * @param root state
 * @return ChartOffsetInternal
 */
const selectChartOffsetInternal = exports.selectChartOffsetInternal = (0, _reselect.createSelector)([_containerSelectors.selectChartWidth, _containerSelectors.selectChartHeight, _containerSelectors.selectMargin, selectBrushHeight, selectLeftAxesOffset, selectRightAxesOffset, selectTopAxesOffset, selectBottomAxesOffset, _legendSelectors.selectLegendSettings, _legendSelectors.selectLegendSize], (chartWidth, chartHeight, margin, brushHeight, leftAxesOffset, rightAxesOffset, topAxesOffset, bottomAxesOffset, legendSettings, legendSize) => {
  const offsetH = {
    left: (margin.left || 0) + leftAxesOffset,
    right: (margin.right || 0) + rightAxesOffset
  };
  const offsetV = {
    top: (margin.top || 0) + topAxesOffset,
    bottom: (margin.bottom || 0) + bottomAxesOffset
  };
  let offset = _objectSpread(_objectSpread({}, offsetV), offsetH);
  const brushBottom = offset.bottom;
  offset.bottom += brushHeight;
  offset = (0, _ChartUtils.appendOffsetOfLegend)(offset, legendSettings, legendSize);
  const offsetWidth = chartWidth - offset.left - offset.right;
  const offsetHeight = chartHeight - offset.top - offset.bottom;
  return _objectSpread(_objectSpread({
    brushBottom
  }, offset), {}, {
    // never return negative values for height and width
    width: Math.max(offsetWidth, 0),
    height: Math.max(offsetHeight, 0)
  });
});
const selectChartViewBox = exports.selectChartViewBox = (0, _reselect.createSelector)(selectChartOffsetInternal, offset => ({
  x: offset.left,
  y: offset.top,
  width: offset.width,
  height: offset.height
}));
const selectAxisViewBox = exports.selectAxisViewBox = (0, _reselect.createSelector)(_containerSelectors.selectChartWidth, _containerSelectors.selectChartHeight, (width, height) => ({
  x: 0,
  y: 0,
  width,
  height
}));
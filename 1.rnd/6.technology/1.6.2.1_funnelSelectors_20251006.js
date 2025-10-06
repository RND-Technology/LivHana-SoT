"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectFunnelTrapezoids = void 0;
const _reselect = require("reselect");
const _Funnel = require("../../cartesian/Funnel");
const _selectChartOffsetInternal = require("./selectChartOffsetInternal");
const _dataSelectors = require("./dataSelectors");
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const pickFunnelSettings = (_state, funnelSettings) => funnelSettings;
const selectFunnelTrapezoids = exports.selectFunnelTrapezoids = (0, _reselect.createSelector)([_selectChartOffsetInternal.selectChartOffsetInternal, pickFunnelSettings, _dataSelectors.selectChartDataAndAlwaysIgnoreIndexes], (offset, _ref, _ref2) => {
  const {
    data,
    dataKey,
    nameKey,
    tooltipType,
    lastShapeType,
    reversed,
    customWidth,
    cells,
    presentationProps
  } = _ref;
  const {
    chartData
  } = _ref2;
  let displayedData;
  if (data != null && data.length > 0) {
    displayedData = data;
  } else if (chartData != null && chartData.length > 0) {
    displayedData = chartData;
  }
  if (displayedData && displayedData.length) {
    displayedData = displayedData.map((entry, index) => _objectSpread(_objectSpread(_objectSpread({
      payload: entry
    }, presentationProps), entry), cells && cells[index] && cells[index].props));
  } else if (cells && cells.length) {
    displayedData = cells.map(cell => _objectSpread(_objectSpread({}, presentationProps), cell.props));
  } else {
    return [];
  }
  return (0, _Funnel.computeFunnelTrapezoids)({
    dataKey,
    nameKey,
    displayedData,
    tooltipType,
    lastShapeType,
    reversed,
    offset,
    customWidth
  });
});
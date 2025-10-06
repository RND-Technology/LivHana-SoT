"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTooltipAxisBandSize = exports.useTooltipAxis = void 0;
const _hooks = require("../state/hooks");
const _ChartUtils = require("../util/ChartUtils");
const _tooltipSelectors = require("../state/selectors/tooltipSelectors");
const _selectTooltipAxis = require("../state/selectors/selectTooltipAxis");
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const useTooltipAxis = () => (0, _hooks.useAppSelector)(_selectTooltipAxis.selectTooltipAxis);
exports.useTooltipAxis = useTooltipAxis;
const useTooltipAxisBandSize = () => {
  const tooltipAxis = useTooltipAxis();
  const tooltipTicks = (0, _hooks.useAppSelector)(_tooltipSelectors.selectTooltipAxisTicks);
  const tooltipAxisScale = (0, _hooks.useAppSelector)(_tooltipSelectors.selectTooltipAxisScale);
  return (0, _ChartUtils.getBandSizeOfAxis)(_objectSpread(_objectSpread({}, tooltipAxis), {}, {
    scale: tooltipAxisScale
  }), tooltipTicks);
};
exports.useTooltipAxisBandSize = useTooltipAxisBandSize;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ActivePoints = ActivePoints;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _types = require("../util/types");
const _ReactUtils = require("../util/ReactUtils");
const _Dot = require("../shape/Dot");
const _Layer = require("../container/Layer");
const _hooks = require("../state/hooks");
const _tooltipSelectors = require("../state/selectors/tooltipSelectors");
const _hooks2 = require("../hooks");
const _DataUtils = require("../util/DataUtils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const renderActivePoint = _ref => {
  const {
    point,
    childIndex,
    mainColor,
    activeDot,
    dataKey
  } = _ref;
  if (activeDot === false || point.x == null || point.y == null) {
    return null;
  }
  const dotProps = _objectSpread(_objectSpread({
    index: childIndex,
    dataKey,
    cx: point.x,
    cy: point.y,
    r: 4,
    fill: mainColor !== null && mainColor !== void 0 ? mainColor : 'none',
    strokeWidth: 2,
    stroke: '#fff',
    payload: point.payload,
    value: point.value
  }, (0, _ReactUtils.filterProps)(activeDot, false)), (0, _types.adaptEventHandlers)(activeDot));
  let dot;
  if (/*#__PURE__*/(0, _react.isValidElement)(activeDot)) {
    // @ts-expect-error element cloning does not have types
    dot = /*#__PURE__*/(0, _react.cloneElement)(activeDot, dotProps);
  } else if (typeof activeDot === 'function') {
    dot = activeDot(dotProps);
  } else {
    dot = /*#__PURE__*/React.createElement(_Dot.Dot, dotProps);
  }
  return /*#__PURE__*/React.createElement(_Layer.Layer, {
    className: "recharts-active-dot"
  }, dot);
};
function ActivePoints(_ref2) {
  const {
    points,
    mainColor,
    activeDot,
    itemDataKey
  } = _ref2;
  const activeTooltipIndex = (0, _hooks.useAppSelector)(_tooltipSelectors.selectActiveTooltipIndex);
  const activeDataPoints = (0, _hooks2.useActiveTooltipDataPoints)();
  if (points == null || activeDataPoints == null) {
    return null;
  }
  const activePoint = points.find(p => activeDataPoints.includes(p.payload));
  if ((0, _DataUtils.isNullish)(activePoint)) {
    return null;
  }
  return renderActivePoint({
    point: activePoint,
    childIndex: Number(activeTooltipIndex),
    mainColor,
    dataKey: itemDataKey,
    activeDot
  });
}
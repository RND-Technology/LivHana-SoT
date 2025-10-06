"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RootSurface = void 0;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _chartLayoutContext = require("../context/chartLayoutContext");
const _accessibilityContext = require("../context/accessibilityContext");
const _PanoramaContext = require("../context/PanoramaContext");
const _Surface = require("./Surface");
const _hooks = require("../state/hooks");
const _brushSelectors = require("../state/selectors/brushSelectors");
const _isWellBehavedNumber = require("../util/isWellBehavedNumber");
const _excluded = ["children"];
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const FULL_WIDTH_AND_HEIGHT = {
  width: '100%',
  height: '100%'
};
const MainChartSurface = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
  const width = (0, _chartLayoutContext.useChartWidth)();
  const height = (0, _chartLayoutContext.useChartHeight)();
  const hasAccessibilityLayer = (0, _accessibilityContext.useAccessibilityLayer)();
  if (!(0, _isWellBehavedNumber.isPositiveNumber)(width) || !(0, _isWellBehavedNumber.isPositiveNumber)(height)) {
    return null;
  }
  const {
    children,
    otherAttributes,
    title,
    desc
  } = props;
  let tabIndex, role;
  if (typeof otherAttributes.tabIndex === 'number') {
    tabIndex = otherAttributes.tabIndex;
  } else {
    tabIndex = hasAccessibilityLayer ? 0 : undefined;
  }
  if (typeof otherAttributes.role === 'string') {
    role = otherAttributes.role;
  } else {
    role = hasAccessibilityLayer ? 'application' : undefined;
  }
  return /*#__PURE__*/React.createElement(_Surface.Surface, _extends({}, otherAttributes, {
    title: title,
    desc: desc,
    role: role,
    tabIndex: tabIndex,
    width: width,
    height: height,
    style: FULL_WIDTH_AND_HEIGHT,
    ref: ref
  }), children);
});
const BrushPanoramaSurface = _ref => {
  const {
    children
  } = _ref;
  const brushDimensions = (0, _hooks.useAppSelector)(_brushSelectors.selectBrushDimensions);
  if (!brushDimensions) {
    return null;
  }
  const {
    width,
    height,
    y,
    x
  } = brushDimensions;
  return /*#__PURE__*/React.createElement(_Surface.Surface, {
    width: width,
    height: height,
    x: x,
    y: y
  }, children);
};
const RootSurface = exports.RootSurface = /*#__PURE__*/(0, _react.forwardRef)((_ref2, ref) => {
  let {
      children
    } = _ref2,
    rest = _objectWithoutProperties(_ref2, _excluded);
  const isPanorama = (0, _PanoramaContext.useIsPanorama)();
  if (isPanorama) {
    return /*#__PURE__*/React.createElement(BrushPanoramaSurface, null, children);
  }
  return /*#__PURE__*/React.createElement(MainChartSurface, _extends({
    ref: ref
  }, rest), children);
});
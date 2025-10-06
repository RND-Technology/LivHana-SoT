"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Trapezoid = void 0;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _clsx = require("clsx");
const _ReactUtils = require("../util/ReactUtils");
const _resolveDefaultProps = require("../util/resolveDefaultProps");
const _JavascriptAnimate = require("../animation/JavascriptAnimate");
const _useAnimationId = require("../util/useAnimationId");
const _DataUtils = require("../util/DataUtils");
const _util = require("../animation/util");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); } /**
 * @fileOverview Rectangle
 */
const getTrapezoidPath = (x, y, upperWidth, lowerWidth, height) => {
  const widthGap = upperWidth - lowerWidth;
  let path;
  path = "M ".concat(x, ",").concat(y);
  path += "L ".concat(x + upperWidth, ",").concat(y);
  path += "L ".concat(x + upperWidth - widthGap / 2, ",").concat(y + height);
  path += "L ".concat(x + upperWidth - widthGap / 2 - lowerWidth, ",").concat(y + height);
  path += "L ".concat(x, ",").concat(y, " Z");
  return path;
};
const defaultProps = {
  x: 0,
  y: 0,
  upperWidth: 0,
  lowerWidth: 0,
  height: 0,
  isUpdateAnimationActive: false,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease'
};
const Trapezoid = outsideProps => {
  const trapezoidProps = (0, _resolveDefaultProps.resolveDefaultProps)(outsideProps, defaultProps);
  const {
    x,
    y,
    upperWidth,
    lowerWidth,
    height,
    className
  } = trapezoidProps;
  const {
    animationEasing,
    animationDuration,
    animationBegin,
    isUpdateAnimationActive
  } = trapezoidProps;
  const pathRef = (0, _react.useRef)();
  const [totalLength, setTotalLength] = (0, _react.useState)(-1);
  const prevUpperWidthRef = (0, _react.useRef)(upperWidth);
  const prevLowerWidthRef = (0, _react.useRef)(lowerWidth);
  const prevHeightRef = (0, _react.useRef)(height);
  const prevXRef = (0, _react.useRef)(x);
  const prevYRef = (0, _react.useRef)(y);
  const animationId = (0, _useAnimationId.useAnimationId)(outsideProps, 'trapezoid-');
  (0, _react.useEffect)(() => {
    if (pathRef.current && pathRef.current.getTotalLength) {
      try {
        const pathTotalLength = pathRef.current.getTotalLength();
        if (pathTotalLength) {
          setTotalLength(pathTotalLength);
        }
      } catch (_unused) {
        // calculate total length error
      }
    }
  }, []);
  if (x !== +x || y !== +y || upperWidth !== +upperWidth || lowerWidth !== +lowerWidth || height !== +height || upperWidth === 0 && lowerWidth === 0 || height === 0) {
    return null;
  }
  const layerClass = (0, _clsx.clsx)('recharts-trapezoid', className);
  if (!isUpdateAnimationActive) {
    return /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", _extends({}, (0, _ReactUtils.filterProps)(trapezoidProps, true), {
      className: layerClass,
      d: getTrapezoidPath(x, y, upperWidth, lowerWidth, height)
    })));
  }
  const prevUpperWidth = prevUpperWidthRef.current;
  const prevLowerWidth = prevLowerWidthRef.current;
  const prevHeight = prevHeightRef.current;
  const prevX = prevXRef.current;
  const prevY = prevYRef.current;
  const from = "0px ".concat(totalLength === -1 ? 1 : totalLength, "px");
  const to = "".concat(totalLength, "px 0px");
  const transition = (0, _util.getTransitionVal)(['strokeDasharray'], animationDuration, animationEasing);
  return /*#__PURE__*/React.createElement(_JavascriptAnimate.JavascriptAnimate, {
    animationId: animationId,
    key: animationId,
    canBegin: totalLength > 0,
    duration: animationDuration,
    easing: animationEasing,
    isActive: isUpdateAnimationActive,
    begin: animationBegin
  }, t => {
    const currUpperWidth = (0, _DataUtils.interpolate)(prevUpperWidth, upperWidth, t);
    const currLowerWidth = (0, _DataUtils.interpolate)(prevLowerWidth, lowerWidth, t);
    const currHeight = (0, _DataUtils.interpolate)(prevHeight, height, t);
    const currX = (0, _DataUtils.interpolate)(prevX, x, t);
    const currY = (0, _DataUtils.interpolate)(prevY, y, t);
    if (pathRef.current) {
      prevUpperWidthRef.current = currUpperWidth;
      prevLowerWidthRef.current = currLowerWidth;
      prevHeightRef.current = currHeight;
      prevXRef.current = currX;
      prevYRef.current = currY;
    }
    const animationStyle = t > 0 ? {
      transition,
      strokeDasharray: to
    } : {
      strokeDasharray: from
    };
    return /*#__PURE__*/React.createElement("path", _extends({}, (0, _ReactUtils.filterProps)(trapezoidProps, true), {
      className: layerClass,
      d: getTrapezoidPath(currX, currY, currUpperWidth, currLowerWidth, currHeight),
      ref: pathRef,
      style: _objectSpread(_objectSpread({}, animationStyle), trapezoidProps.style)
    }));
  });
};
exports.Trapezoid = Trapezoid;
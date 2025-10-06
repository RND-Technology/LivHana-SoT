"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PolarGrid = void 0;
const _clsx = require("clsx");
const React = _interopRequireWildcard(require("react"));
const _PolarUtils = require("../util/PolarUtils");
const _hooks = require("../state/hooks");
const _polarGridSelectors = require("../state/selectors/polarGridSelectors");
const _polarAxisSelectors = require("../state/selectors/polarAxisSelectors");
const _svgPropertiesNoEvents = require("../util/svgPropertiesNoEvents");
const _excluded = ["gridType", "radialLines", "angleAxisId", "radiusAxisId", "cx", "cy", "innerRadius", "outerRadius"];
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const getPolygonPath = (radius, cx, cy, polarAngles) => {
  let path = '';
  polarAngles.forEach((angle, i) => {
    const point = (0, _PolarUtils.polarToCartesian)(cx, cy, radius, angle);
    if (i) {
      path += "L ".concat(point.x, ",").concat(point.y);
    } else {
      path += "M ".concat(point.x, ",").concat(point.y);
    }
  });
  path += 'Z';
  return path;
};

// Draw axis of radial line
const PolarAngles = props => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    polarAngles,
    radialLines
  } = props;
  if (!polarAngles || !polarAngles.length || !radialLines) {
    return null;
  }
  const polarAnglesProps = _objectSpread({
    stroke: '#ccc'
  }, (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(props));
  return /*#__PURE__*/React.createElement("g", {
    className: "recharts-polar-grid-angle"
  }, polarAngles.map(entry => {
    const start = (0, _PolarUtils.polarToCartesian)(cx, cy, innerRadius, entry);
    const end = (0, _PolarUtils.polarToCartesian)(cx, cy, outerRadius, entry);
    return /*#__PURE__*/React.createElement("line", _extends({}, polarAnglesProps, {
      key: "line-".concat(entry),
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y
    }));
  }));
};

// Draw concentric circles
const ConcentricCircle = props => {
  const {
    cx,
    cy,
    radius
  } = props;
  const concentricCircleProps = _objectSpread({
    stroke: '#ccc',
    fill: 'none'
  }, (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(props));
  return (
    /*#__PURE__*/
    // @ts-expect-error wrong SVG element type
    React.createElement("circle", _extends({}, concentricCircleProps, {
      className: (0, _clsx.clsx)('recharts-polar-grid-concentric-circle', props.className),
      cx: cx,
      cy: cy,
      r: radius
    }))
  );
};

// Draw concentric polygons
const ConcentricPolygon = props => {
  const {
    radius
  } = props;
  const concentricPolygonProps = _objectSpread({
    stroke: '#ccc',
    fill: 'none'
  }, (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(props));
  return /*#__PURE__*/React.createElement("path", _extends({}, concentricPolygonProps, {
    className: (0, _clsx.clsx)('recharts-polar-grid-concentric-polygon', props.className),
    d: getPolygonPath(radius, props.cx, props.cy, props.polarAngles)
  }));
};

// Draw concentric axis
const ConcentricGridPath = props => {
  const {
    polarRadius,
    gridType
  } = props;
  if (!polarRadius || !polarRadius.length) {
    return null;
  }
  const maxPolarRadius = Math.max(...polarRadius);
  const renderBackground = props.fill && props.fill !== 'none';
  return /*#__PURE__*/React.createElement("g", {
    className: "recharts-polar-grid-concentric"
  }, renderBackground && gridType === 'circle' && /*#__PURE__*/React.createElement(ConcentricCircle, _extends({}, props, {
    radius: maxPolarRadius
  })), renderBackground && gridType !== 'circle' && /*#__PURE__*/React.createElement(ConcentricPolygon, _extends({}, props, {
    radius: maxPolarRadius
  })), polarRadius.map((entry, i) => {
    const key = i;
    if (gridType === 'circle') {
      return /*#__PURE__*/React.createElement(ConcentricCircle, _extends({
        key: key
      }, props, {
        fill: "none",
        radius: entry
      }));
    }
    return /*#__PURE__*/React.createElement(ConcentricPolygon, _extends({
      key: key
    }, props, {
      fill: "none",
      radius: entry
    }));
  }));
};
const PolarGrid = _ref => {
  let _ref2, _polarViewBox$cx, _ref3, _polarViewBox$cy, _ref4, _polarViewBox$innerRa, _ref5, _polarViewBox$outerRa;
  let {
      gridType = 'polygon',
      radialLines = true,
      angleAxisId = 0,
      radiusAxisId = 0,
      cx: cxFromOutside,
      cy: cyFromOutside,
      innerRadius: innerRadiusFromOutside,
      outerRadius: outerRadiusFromOutside
    } = _ref,
    inputs = _objectWithoutProperties(_ref, _excluded);
  const polarViewBox = (0, _hooks.useAppSelector)(_polarAxisSelectors.selectPolarViewBox);
  const props = _objectSpread({
    cx: (_ref2 = (_polarViewBox$cx = polarViewBox === null || polarViewBox === void 0 ? void 0 : polarViewBox.cx) !== null && _polarViewBox$cx !== void 0 ? _polarViewBox$cx : cxFromOutside) !== null && _ref2 !== void 0 ? _ref2 : 0,
    cy: (_ref3 = (_polarViewBox$cy = polarViewBox === null || polarViewBox === void 0 ? void 0 : polarViewBox.cy) !== null && _polarViewBox$cy !== void 0 ? _polarViewBox$cy : cyFromOutside) !== null && _ref3 !== void 0 ? _ref3 : 0,
    innerRadius: (_ref4 = (_polarViewBox$innerRa = polarViewBox === null || polarViewBox === void 0 ? void 0 : polarViewBox.innerRadius) !== null && _polarViewBox$innerRa !== void 0 ? _polarViewBox$innerRa : innerRadiusFromOutside) !== null && _ref4 !== void 0 ? _ref4 : 0,
    outerRadius: (_ref5 = (_polarViewBox$outerRa = polarViewBox === null || polarViewBox === void 0 ? void 0 : polarViewBox.outerRadius) !== null && _polarViewBox$outerRa !== void 0 ? _polarViewBox$outerRa : outerRadiusFromOutside) !== null && _ref5 !== void 0 ? _ref5 : 0
  }, inputs);
  const {
    polarAngles: polarAnglesInput,
    polarRadius: polarRadiusInput,
    outerRadius
  } = props;
  const polarAnglesFromRedux = (0, _hooks.useAppSelector)(state => (0, _polarGridSelectors.selectPolarGridAngles)(state, angleAxisId));
  const polarRadiiFromRedux = (0, _hooks.useAppSelector)(state => (0, _polarGridSelectors.selectPolarGridRadii)(state, radiusAxisId));
  const polarAngles = Array.isArray(polarAnglesInput) ? polarAnglesInput : polarAnglesFromRedux;
  const polarRadius = Array.isArray(polarRadiusInput) ? polarRadiusInput : polarRadiiFromRedux;
  if (outerRadius <= 0 || polarAngles == null || polarRadius == null) {
    return null;
  }
  return /*#__PURE__*/React.createElement("g", {
    className: "recharts-polar-grid"
  }, /*#__PURE__*/React.createElement(ConcentricGridPath, _extends({
    gridType: gridType,
    radialLines: radialLines
  }, props, {
    polarAngles: polarAngles,
    polarRadius: polarRadius
  })), /*#__PURE__*/React.createElement(PolarAngles, _extends({
    gridType: gridType,
    radialLines: radialLines
  }, props, {
    polarAngles: polarAngles,
    polarRadius: polarRadius
  })));
};
exports.PolarGrid = PolarGrid;
PolarGrid.displayName = 'PolarGrid';
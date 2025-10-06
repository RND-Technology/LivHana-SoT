"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Polygon = void 0;
const React = _interopRequireWildcard(require("react"));
const _clsx = require("clsx");
const _ReactUtils = require("../util/ReactUtils");
const _excluded = ["points", "className", "baseLinePoints", "connectNulls"];
/**
 * @fileOverview Polygon
 */
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
const isValidatePoint = point => {
  return point && point.x === +point.x && point.y === +point.y;
};
const getParsedPoints = function getParsedPoints() {
  const points = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  let segmentPoints = [[]];
  points.forEach(entry => {
    if (isValidatePoint(entry)) {
      segmentPoints[segmentPoints.length - 1].push(entry);
    } else if (segmentPoints[segmentPoints.length - 1].length > 0) {
      // add another path
      segmentPoints.push([]);
    }
  });
  if (isValidatePoint(points[0])) {
    segmentPoints[segmentPoints.length - 1].push(points[0]);
  }
  if (segmentPoints[segmentPoints.length - 1].length <= 0) {
    segmentPoints = segmentPoints.slice(0, -1);
  }
  return segmentPoints;
};
const getSinglePolygonPath = (points, connectNulls) => {
  let segmentPoints = getParsedPoints(points);
  if (connectNulls) {
    segmentPoints = [segmentPoints.reduce((res, segPoints) => {
      return [...res, ...segPoints];
    }, [])];
  }
  const polygonPath = segmentPoints.map(segPoints => {
    return segPoints.reduce((path, point, index) => {
      return "".concat(path).concat(index === 0 ? 'M' : 'L').concat(point.x, ",").concat(point.y);
    }, '');
  }).join('');
  return segmentPoints.length === 1 ? "".concat(polygonPath, "Z") : polygonPath;
};
const getRanglePath = (points, baseLinePoints, connectNulls) => {
  const outerPath = getSinglePolygonPath(points, connectNulls);
  return "".concat(outerPath.slice(-1) === 'Z' ? outerPath.slice(0, -1) : outerPath, "L").concat(getSinglePolygonPath(Array.from(baseLinePoints).reverse(), connectNulls).slice(1));
};
const Polygon = props => {
  let {
      points,
      className,
      baseLinePoints,
      connectNulls
    } = props,
    others = _objectWithoutProperties(props, _excluded);
  if (!points || !points.length) {
    return null;
  }
  const layerClass = (0, _clsx.clsx)('recharts-polygon', className);
  if (baseLinePoints && baseLinePoints.length) {
    const hasStroke = others.stroke && others.stroke !== 'none';
    const rangePath = getRanglePath(points, baseLinePoints, connectNulls);
    return /*#__PURE__*/React.createElement("g", {
      className: layerClass
    }, /*#__PURE__*/React.createElement("path", _extends({}, (0, _ReactUtils.filterProps)(others, true), {
      fill: rangePath.slice(-1) === 'Z' ? others.fill : 'none',
      stroke: "none",
      d: rangePath
    })), hasStroke ? /*#__PURE__*/React.createElement("path", _extends({}, (0, _ReactUtils.filterProps)(others, true), {
      fill: "none",
      d: getSinglePolygonPath(points, connectNulls)
    })) : null, hasStroke ? /*#__PURE__*/React.createElement("path", _extends({}, (0, _ReactUtils.filterProps)(others, true), {
      fill: "none",
      d: getSinglePolygonPath(baseLinePoints, connectNulls)
    })) : null);
  }
  const singlePath = getSinglePolygonPath(points, connectNulls);
  return /*#__PURE__*/React.createElement("path", _extends({}, (0, _ReactUtils.filterProps)(others, true), {
    fill: singlePath.slice(-1) === 'Z' ? others.fill : 'none',
    className: layerClass,
    d: singlePath
  }));
};
exports.Polygon = Polygon;
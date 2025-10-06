"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.radianToDegree = exports.polarToCartesian = exports.inRangeOfSector = exports.getTickClassName = exports.getMaxRadius = exports.getAngleOfPoint = exports.formatAngleOfSector = exports.distanceBetweenPoints = exports.degreeToRadian = exports.RADIAN = void 0;
const _react = require("react");
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const RADIAN = exports.RADIAN = Math.PI / 180;
const degreeToRadian = angle => angle * Math.PI / 180;
exports.degreeToRadian = degreeToRadian;
const radianToDegree = angleInRadian => angleInRadian * 180 / Math.PI;
exports.radianToDegree = radianToDegree;
const polarToCartesian = (cx, cy, radius, angle) => ({
  x: cx + Math.cos(-RADIAN * angle) * radius,
  y: cy + Math.sin(-RADIAN * angle) * radius
});
exports.polarToCartesian = polarToCartesian;
const getMaxRadius = exports.getMaxRadius = function getMaxRadius(width, height) {
  const offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    brushBottom: 0
  };
  return Math.min(Math.abs(width - (offset.left || 0) - (offset.right || 0)), Math.abs(height - (offset.top || 0) - (offset.bottom || 0))) / 2;
};
const distanceBetweenPoints = (point, anotherPoint) => {
  const {
    x: x1,
    y: y1
  } = point;
  const {
    x: x2,
    y: y2
  } = anotherPoint;
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
};
exports.distanceBetweenPoints = distanceBetweenPoints;
const getAngleOfPoint = (_ref, _ref2) => {
  const {
    x,
    y
  } = _ref;
  const {
    cx,
    cy
  } = _ref2;
  const radius = distanceBetweenPoints({
    x,
    y
  }, {
    x: cx,
    y: cy
  });
  if (radius <= 0) {
    return {
      radius,
      angle: 0
    };
  }
  const cos = (x - cx) / radius;
  let angleInRadian = Math.acos(cos);
  if (y > cy) {
    angleInRadian = 2 * Math.PI - angleInRadian;
  }
  return {
    radius,
    angle: radianToDegree(angleInRadian),
    angleInRadian
  };
};
exports.getAngleOfPoint = getAngleOfPoint;
const formatAngleOfSector = _ref3 => {
  const {
    startAngle,
    endAngle
  } = _ref3;
  const startCnt = Math.floor(startAngle / 360);
  const endCnt = Math.floor(endAngle / 360);
  const min = Math.min(startCnt, endCnt);
  return {
    startAngle: startAngle - min * 360,
    endAngle: endAngle - min * 360
  };
};
exports.formatAngleOfSector = formatAngleOfSector;
const reverseFormatAngleOfSector = (angle, _ref4) => {
  const {
    startAngle,
    endAngle
  } = _ref4;
  const startCnt = Math.floor(startAngle / 360);
  const endCnt = Math.floor(endAngle / 360);
  const min = Math.min(startCnt, endCnt);
  return angle + min * 360;
};
const inRangeOfSector = (_ref5, viewBox) => {
  const {
    x,
    y
  } = _ref5;
  const {
    radius,
    angle
  } = getAngleOfPoint({
    x,
    y
  }, viewBox);
  const {
    innerRadius,
    outerRadius
  } = viewBox;
  if (radius < innerRadius || radius > outerRadius) {
    return null;
  }
  if (radius === 0) {
    return null;
  }
  const {
    startAngle,
    endAngle
  } = formatAngleOfSector(viewBox);
  let formatAngle = angle;
  let inRange;
  if (startAngle <= endAngle) {
    while (formatAngle > endAngle) {
      formatAngle -= 360;
    }
    while (formatAngle < startAngle) {
      formatAngle += 360;
    }
    inRange = formatAngle >= startAngle && formatAngle <= endAngle;
  } else {
    while (formatAngle > startAngle) {
      formatAngle -= 360;
    }
    while (formatAngle < endAngle) {
      formatAngle += 360;
    }
    inRange = formatAngle >= endAngle && formatAngle <= startAngle;
  }
  if (inRange) {
    return _objectSpread(_objectSpread({}, viewBox), {}, {
      radius,
      angle: reverseFormatAngleOfSector(formatAngle, viewBox)
    });
  }
  return null;
};
exports.inRangeOfSector = inRangeOfSector;
const getTickClassName = tick => ! /*#__PURE__*/(0, _react.isValidElement)(tick) && typeof tick !== 'function' && typeof tick !== 'boolean' && tick != null ? tick.className : '';
exports.getTickClassName = getTickClassName;
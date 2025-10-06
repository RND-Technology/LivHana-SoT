"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTicks = getTicks;
const _DataUtils = require("../util/DataUtils");
const _DOMUtils = require("../util/DOMUtils");
const _Global = require("../util/Global");
const _TickUtils = require("../util/TickUtils");
const _getEquidistantTicks = require("./getEquidistantTicks");
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function getTicksEnd(sign, boundaries, getTickSize, ticks, minTickGap) {
  const result = (ticks || []).slice();
  const len = result.length;
  const {
    start
  } = boundaries;
  let {
    end
  } = boundaries;
  const _loop = function _loop(i) {
    let entry = result[i];
    let size;
    const getSize = () => {
      if (size === undefined) {
        size = getTickSize(entry, i);
      }
      return size;
    };
    if (i === len - 1) {
      const gap = sign * (entry.coordinate + sign * getSize() / 2 - end);
      result[i] = entry = _objectSpread(_objectSpread({}, entry), {}, {
        tickCoord: gap > 0 ? entry.coordinate - gap * sign : entry.coordinate
      });
    } else {
      result[i] = entry = _objectSpread(_objectSpread({}, entry), {}, {
        tickCoord: entry.coordinate
      });
    }
    const isShow = (0, _TickUtils.isVisible)(sign, entry.tickCoord, getSize, start, end);
    if (isShow) {
      end = entry.tickCoord - sign * (getSize() / 2 + minTickGap);
      result[i] = _objectSpread(_objectSpread({}, entry), {}, {
        isShow: true
      });
    }
  };
  for (let i = len - 1; i >= 0; i--) {
    _loop(i);
  }
  return result;
}
function getTicksStart(sign, boundaries, getTickSize, ticks, minTickGap, preserveEnd) {
  // This method is mutating the array so clone is indeed necessary here
  const result = (ticks || []).slice();
  const len = result.length;
  let {
    start,
    end
  } = boundaries;
  if (preserveEnd) {
    // Try to guarantee the tail to be displayed
    let tail = ticks[len - 1];
    const tailSize = getTickSize(tail, len - 1);
    const tailGap = sign * (tail.coordinate + sign * tailSize / 2 - end);
    result[len - 1] = tail = _objectSpread(_objectSpread({}, tail), {}, {
      tickCoord: tailGap > 0 ? tail.coordinate - tailGap * sign : tail.coordinate
    });
    const isTailShow = (0, _TickUtils.isVisible)(sign, tail.tickCoord, () => tailSize, start, end);
    if (isTailShow) {
      end = tail.tickCoord - sign * (tailSize / 2 + minTickGap);
      result[len - 1] = _objectSpread(_objectSpread({}, tail), {}, {
        isShow: true
      });
    }
  }
  const count = preserveEnd ? len - 1 : len;
  const _loop2 = function _loop2(i) {
    let entry = result[i];
    let size;
    const getSize = () => {
      if (size === undefined) {
        size = getTickSize(entry, i);
      }
      return size;
    };
    if (i === 0) {
      const gap = sign * (entry.coordinate - sign * getSize() / 2 - start);
      result[i] = entry = _objectSpread(_objectSpread({}, entry), {}, {
        tickCoord: gap < 0 ? entry.coordinate - gap * sign : entry.coordinate
      });
    } else {
      result[i] = entry = _objectSpread(_objectSpread({}, entry), {}, {
        tickCoord: entry.coordinate
      });
    }
    const isShow = (0, _TickUtils.isVisible)(sign, entry.tickCoord, getSize, start, end);
    if (isShow) {
      start = entry.tickCoord + sign * (getSize() / 2 + minTickGap);
      result[i] = _objectSpread(_objectSpread({}, entry), {}, {
        isShow: true
      });
    }
  };
  for (let i = 0; i < count; i++) {
    _loop2(i);
  }
  return result;
}
function getTicks(props, fontSize, letterSpacing) {
  const {
    tick,
    ticks,
    viewBox,
    minTickGap,
    orientation,
    interval,
    tickFormatter,
    unit,
    angle
  } = props;
  if (!ticks || !ticks.length || !tick) {
    return [];
  }
  if ((0, _DataUtils.isNumber)(interval) || _Global.Global.isSsr) {
    let _getNumberIntervalTic;
    return (_getNumberIntervalTic = (0, _TickUtils.getNumberIntervalTicks)(ticks, (0, _DataUtils.isNumber)(interval) ? interval : 0)) !== null && _getNumberIntervalTic !== void 0 ? _getNumberIntervalTic : [];
  }
  let candidates = [];
  const sizeKey = orientation === 'top' || orientation === 'bottom' ? 'width' : 'height';
  const unitSize = unit && sizeKey === 'width' ? (0, _DOMUtils.getStringSize)(unit, {
    fontSize,
    letterSpacing
  }) : {
    width: 0,
    height: 0
  };
  const getTickSize = (content, index) => {
    const value = typeof tickFormatter === 'function' ? tickFormatter(content.value, index) : content.value;
    // Recharts only supports angles when sizeKey === 'width'
    return sizeKey === 'width' ? (0, _TickUtils.getAngledTickWidth)((0, _DOMUtils.getStringSize)(value, {
      fontSize,
      letterSpacing
    }), unitSize, angle) : (0, _DOMUtils.getStringSize)(value, {
      fontSize,
      letterSpacing
    })[sizeKey];
  };
  const sign = ticks.length >= 2 ? (0, _DataUtils.mathSign)(ticks[1].coordinate - ticks[0].coordinate) : 1;
  const boundaries = (0, _TickUtils.getTickBoundaries)(viewBox, sign, sizeKey);
  if (interval === 'equidistantPreserveStart') {
    return (0, _getEquidistantTicks.getEquidistantTicks)(sign, boundaries, getTickSize, ticks, minTickGap);
  }
  if (interval === 'preserveStart' || interval === 'preserveStartEnd') {
    candidates = getTicksStart(sign, boundaries, getTickSize, ticks, minTickGap, interval === 'preserveStartEnd');
  } else {
    candidates = getTicksEnd(sign, boundaries, getTickSize, ticks, minTickGap);
  }
  return candidates.filter(entry => entry.isShow);
}
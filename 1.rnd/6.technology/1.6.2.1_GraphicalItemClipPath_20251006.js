"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GraphicalItemClipPath = GraphicalItemClipPath;
exports.useNeedsClip = useNeedsClip;
const React = _interopRequireWildcard(require("react"));
const _hooks = require("../state/hooks");
const _axisSelectors = require("../state/selectors/axisSelectors");
const _hooks2 = require("../hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function useNeedsClip(xAxisId, yAxisId) {
  let _xAxis$allowDataOverf, _yAxis$allowDataOverf;
  const xAxis = (0, _hooks.useAppSelector)(state => (0, _axisSelectors.selectXAxisSettings)(state, xAxisId));
  const yAxis = (0, _hooks.useAppSelector)(state => (0, _axisSelectors.selectYAxisSettings)(state, yAxisId));
  const needClipX = (_xAxis$allowDataOverf = xAxis === null || xAxis === void 0 ? void 0 : xAxis.allowDataOverflow) !== null && _xAxis$allowDataOverf !== void 0 ? _xAxis$allowDataOverf : _axisSelectors.implicitXAxis.allowDataOverflow;
  const needClipY = (_yAxis$allowDataOverf = yAxis === null || yAxis === void 0 ? void 0 : yAxis.allowDataOverflow) !== null && _yAxis$allowDataOverf !== void 0 ? _yAxis$allowDataOverf : _axisSelectors.implicitYAxis.allowDataOverflow;
  const needClip = needClipX || needClipY;
  return {
    needClip,
    needClipX,
    needClipY
  };
}
function GraphicalItemClipPath(_ref) {
  const {
    xAxisId,
    yAxisId,
    clipPathId
  } = _ref;
  const plotArea = (0, _hooks2.usePlotArea)();
  const {
    needClipX,
    needClipY,
    needClip
  } = useNeedsClip(xAxisId, yAxisId);
  if (!needClip) {
    return null;
  }
  const {
    x,
    y,
    width,
    height
  } = plotArea;
  return /*#__PURE__*/React.createElement("clipPath", {
    id: "clipPath-".concat(clipPathId)
  }, /*#__PURE__*/React.createElement("rect", {
    x: needClipX ? x : x - width / 2,
    y: needClipY ? y : y - height / 2,
    width: needClipX ? width : width * 2,
    height: needClipY ? height : height * 2
  }));
}
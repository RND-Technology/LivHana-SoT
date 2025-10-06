"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEndPoints = exports.ReferenceLine = void 0;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _clsx = require("clsx");
const _Layer = require("../container/Layer");
const _Label = require("../component/Label");
const _DataUtils = require("../util/DataUtils");
const _CartesianUtils = require("../util/CartesianUtils");
const _ReactUtils = require("../util/ReactUtils");
const _chartLayoutContext = require("../context/chartLayoutContext");
const _referenceElementsSlice = require("../state/referenceElementsSlice");
const _hooks = require("../state/hooks");
const _axisSelectors = require("../state/selectors/axisSelectors");
const _PanoramaContext = require("../context/PanoramaContext");
const _ClipPathProvider = require("../container/ClipPathProvider");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); } /**
 * @fileOverview Reference Line
 */
/**
 * This excludes `viewBox` prop from svg for two reasons:
 * 1. The components wants viewBox of object type, and svg wants string
 *    - so there's a conflict, and the component will throw if it gets string
 * 2. Internally the component calls `filterProps` which filters the viewBox away anyway
 */

const renderLine = (option, props) => {
  let line;
  if (/*#__PURE__*/React.isValidElement(option)) {
    line = /*#__PURE__*/React.cloneElement(option, props);
  } else if (typeof option === 'function') {
    line = option(props);
  } else {
    line = /*#__PURE__*/React.createElement("line", _extends({}, props, {
      className: "recharts-reference-line-line"
    }));
  }
  return line;
};
// TODO: ScaleHelper
const getEndPoints = (scales, isFixedX, isFixedY, isSegment, viewBox, position, xAxisOrientation, yAxisOrientation, props) => {
  const {
    x,
    y,
    width,
    height
  } = viewBox;
  if (isFixedY) {
    const {
      y: yCoord
    } = props;
    const coord = scales.y.apply(yCoord, {
      position
    });
    // don't render the line if the scale can't compute a result that makes sense
    if ((0, _DataUtils.isNan)(coord)) return null;
    if (props.ifOverflow === 'discard' && !scales.y.isInRange(coord)) {
      return null;
    }
    const points = [{
      x: x + width,
      y: coord
    }, {
      x,
      y: coord
    }];
    return yAxisOrientation === 'left' ? points.reverse() : points;
  }
  if (isFixedX) {
    const {
      x: xCoord
    } = props;
    const _coord = scales.x.apply(xCoord, {
      position
    });
    // don't render the line if the scale can't compute a result that makes sense
    if ((0, _DataUtils.isNan)(_coord)) return null;
    if (props.ifOverflow === 'discard' && !scales.x.isInRange(_coord)) {
      return null;
    }
    const _points = [{
      x: _coord,
      y: y + height
    }, {
      x: _coord,
      y
    }];
    return xAxisOrientation === 'top' ? _points.reverse() : _points;
  }
  if (isSegment) {
    const {
      segment
    } = props;
    const _points2 = segment.map(p => scales.apply(p, {
      position
    }));
    if (props.ifOverflow === 'discard' && _points2.some(p => !scales.isInRange(p))) {
      return null;
    }
    return _points2;
  }
  return null;
};
exports.getEndPoints = getEndPoints;
function ReportReferenceLine(props) {
  const dispatch = (0, _hooks.useAppDispatch)();
  (0, _react.useEffect)(() => {
    dispatch((0, _referenceElementsSlice.addLine)(props));
    return () => {
      dispatch((0, _referenceElementsSlice.removeLine)(props));
    };
  });
  return null;
}
function ReferenceLineImpl(props) {
  const {
    x: fixedX,
    y: fixedY,
    segment,
    xAxisId,
    yAxisId,
    shape,
    className,
    ifOverflow
  } = props;
  const isPanorama = (0, _PanoramaContext.useIsPanorama)();
  const clipPathId = (0, _ClipPathProvider.useClipPathId)();
  const xAxis = (0, _hooks.useAppSelector)(state => (0, _axisSelectors.selectXAxisSettings)(state, xAxisId));
  const yAxis = (0, _hooks.useAppSelector)(state => (0, _axisSelectors.selectYAxisSettings)(state, yAxisId));
  const xAxisScale = (0, _hooks.useAppSelector)(state => (0, _axisSelectors.selectAxisScale)(state, 'xAxis', xAxisId, isPanorama));
  const yAxisScale = (0, _hooks.useAppSelector)(state => (0, _axisSelectors.selectAxisScale)(state, 'yAxis', yAxisId, isPanorama));
  const viewBox = (0, _chartLayoutContext.useViewBox)();
  const isFixedX = (0, _DataUtils.isNumOrStr)(fixedX);
  const isFixedY = (0, _DataUtils.isNumOrStr)(fixedY);
  if (!clipPathId || !viewBox || xAxis == null || yAxis == null || xAxisScale == null || yAxisScale == null) {
    return null;
  }
  const scales = (0, _CartesianUtils.createLabeledScales)({
    x: xAxisScale,
    y: yAxisScale
  });
  const isSegment = segment && segment.length === 2;
  const endPoints = getEndPoints(scales, isFixedX, isFixedY, isSegment, viewBox, props.position, xAxis.orientation, yAxis.orientation, props);
  if (!endPoints) {
    return null;
  }
  const [{
    x: x1,
    y: y1
  }, {
    x: x2,
    y: y2
  }] = endPoints;
  const clipPath = ifOverflow === 'hidden' ? "url(#".concat(clipPathId, ")") : undefined;
  const lineProps = _objectSpread(_objectSpread({
    clipPath
  }, (0, _ReactUtils.filterProps)(props, true)), {}, {
    x1,
    y1,
    x2,
    y2
  });
  return /*#__PURE__*/React.createElement(_Layer.Layer, {
    className: (0, _clsx.clsx)('recharts-reference-line', className)
  }, renderLine(shape, lineProps), /*#__PURE__*/React.createElement(_Label.CartesianLabelContextProvider, (0, _CartesianUtils.rectWithCoords)({
    x1,
    y1,
    x2,
    y2
  }), /*#__PURE__*/React.createElement(_Label.CartesianLabelFromLabelProp, {
    label: props.label
  }), props.children));
}
function ReferenceLineSettingsDispatcher(props) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ReportReferenceLine, {
    yAxisId: props.yAxisId,
    xAxisId: props.xAxisId,
    ifOverflow: props.ifOverflow,
    x: props.x,
    y: props.y
  }), /*#__PURE__*/React.createElement(ReferenceLineImpl, props));
}

// eslint-disable-next-line react/prefer-stateless-function
class ReferenceLine extends _react.Component {
  render() {
    return /*#__PURE__*/React.createElement(ReferenceLineSettingsDispatcher, this.props);
  }
}
exports.ReferenceLine = ReferenceLine;
_defineProperty(ReferenceLine, "displayName", 'ReferenceLine');
_defineProperty(ReferenceLine, "defaultProps", {
  ifOverflow: 'discard',
  xAxisId: 0,
  yAxisId: 0,
  fill: 'none',
  stroke: '#ccc',
  fillOpacity: 1,
  strokeWidth: 1,
  position: 'middle'
});
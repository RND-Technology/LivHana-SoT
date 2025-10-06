"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PolarRadiusAxisWrapper = exports.PolarRadiusAxis = void 0;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _maxBy = _interopRequireDefault(require("es-toolkit/compat/maxBy"));
const _minBy = _interopRequireDefault(require("es-toolkit/compat/minBy"));
const _clsx = require("clsx");
const _Text = require("../component/Text");
const _Label = require("../component/Label");
const _Layer = require("../container/Layer");
const _PolarUtils = require("../util/PolarUtils");
const _types = require("../util/types");
const _ReactUtils = require("../util/ReactUtils");
const _polarAxisSlice = require("../state/polarAxisSlice");
const _hooks = require("../state/hooks");
const _polarScaleSelectors = require("../state/selectors/polarScaleSelectors");
const _polarAxisSelectors = require("../state/selectors/polarAxisSelectors");
const _defaultPolarRadiusAxisProps = require("./defaultPolarRadiusAxisProps");
const _svgPropertiesNoEvents = require("../util/svgPropertiesNoEvents");
const _excluded = ["cx", "cy", "angle", "axisLine"],
  _excluded2 = ["angle", "tickFormatter", "stroke", "tick"];
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
const AXIS_TYPE = 'radiusAxis';
function SetRadiusAxisSettings(settings) {
  const dispatch = (0, _hooks.useAppDispatch)();
  (0, _react.useEffect)(() => {
    dispatch((0, _polarAxisSlice.addRadiusAxis)(settings));
    return () => {
      dispatch((0, _polarAxisSlice.removeRadiusAxis)(settings));
    };
  });
  return null;
}

/**
 * Calculate the coordinate of tick
 * @param coordinate The radius of tick
 * @param angle from props
 * @param cx from chart
 * @param cy from chart
 * @return (x, y)
 */
const getTickValueCoord = (_ref, angle, cx, cy) => {
  const {
    coordinate
  } = _ref;
  return (0, _PolarUtils.polarToCartesian)(cx, cy, coordinate, angle);
};
const getTickTextAnchor = orientation => {
  let textAnchor;
  switch (orientation) {
    case 'left':
      textAnchor = 'end';
      break;
    case 'right':
      textAnchor = 'start';
      break;
    default:
      textAnchor = 'middle';
      break;
  }
  return textAnchor;
};
const getViewBox = (angle, cx, cy, ticks) => {
  const maxRadiusTick = (0, _maxBy.default)(ticks, entry => entry.coordinate || 0);
  const minRadiusTick = (0, _minBy.default)(ticks, entry => entry.coordinate || 0);
  return {
    cx,
    cy,
    startAngle: angle,
    endAngle: angle,
    innerRadius: minRadiusTick.coordinate || 0,
    outerRadius: maxRadiusTick.coordinate || 0,
    clockWise: false
  };
};
const renderAxisLine = (props, ticks) => {
  let {
      cx,
      cy,
      angle,
      axisLine
    } = props,
    others = _objectWithoutProperties(props, _excluded);
  const extent = ticks.reduce((result, entry) => [Math.min(result[0], entry.coordinate), Math.max(result[1], entry.coordinate)], [Infinity, -Infinity]);
  const point0 = (0, _PolarUtils.polarToCartesian)(cx, cy, extent[0], angle);
  const point1 = (0, _PolarUtils.polarToCartesian)(cx, cy, extent[1], angle);
  const axisLineProps = _objectSpread(_objectSpread(_objectSpread({}, (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(others)), {}, {
    fill: 'none'
  }, (0, _ReactUtils.filterProps)(axisLine, false)), {}, {
    x1: point0.x,
    y1: point0.y,
    x2: point1.x,
    y2: point1.y
  });

  // @ts-expect-error wrong SVG element type
  return /*#__PURE__*/React.createElement("line", _extends({
    className: "recharts-polar-radius-axis-line"
  }, axisLineProps));
};
const renderTickItem = (option, tickProps, value) => {
  let tickItem;
  if (/*#__PURE__*/React.isValidElement(option)) {
    tickItem = /*#__PURE__*/React.cloneElement(option, tickProps);
  } else if (typeof option === 'function') {
    tickItem = option(tickProps);
  } else {
    tickItem = /*#__PURE__*/React.createElement(_Text.Text, _extends({}, tickProps, {
      className: "recharts-polar-radius-axis-tick-value"
    }), value);
  }
  return tickItem;
};
const renderTicks = (props, ticks) => {
  let {
      angle,
      tickFormatter,
      stroke,
      tick
    } = props,
    others = _objectWithoutProperties(props, _excluded2);
  const textAnchor = getTickTextAnchor(props.orientation);
  const axisProps = (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(others);
  const customTickProps = (0, _ReactUtils.filterProps)(tick, false);
  const items = ticks.map((entry, i) => {
    const coord = getTickValueCoord(entry, props.angle, props.cx, props.cy);
    const tickProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread({
      textAnchor,
      transform: "rotate(".concat(90 - angle, ", ").concat(coord.x, ", ").concat(coord.y, ")")
    }, axisProps), {}, {
      stroke: 'none',
      fill: stroke
    }, customTickProps), {}, {
      index: i
    }, coord), {}, {
      payload: entry
    });
    return /*#__PURE__*/React.createElement(_Layer.Layer, _extends({
      className: (0, _clsx.clsx)('recharts-polar-radius-axis-tick', (0, _PolarUtils.getTickClassName)(tick)),
      key: "tick-".concat(entry.coordinate)
    }, (0, _types.adaptEventsOfChild)(props, entry, i)), renderTickItem(tick, tickProps, tickFormatter ? tickFormatter(entry.value, i) : entry.value));
  });
  return /*#__PURE__*/React.createElement(_Layer.Layer, {
    className: "recharts-polar-radius-axis-ticks"
  }, items);
};
const PolarRadiusAxisWrapper = defaultsAndInputs => {
  const {
    radiusAxisId
  } = defaultsAndInputs;
  const viewBox = (0, _hooks.useAppSelector)(_polarAxisSelectors.selectPolarViewBox);
  const scale = (0, _hooks.useAppSelector)(state => (0, _polarScaleSelectors.selectPolarAxisScale)(state, 'radiusAxis', radiusAxisId));
  const ticks = (0, _hooks.useAppSelector)(state => (0, _polarScaleSelectors.selectPolarAxisTicks)(state, 'radiusAxis', radiusAxisId, false));
  if (viewBox == null || !ticks || !ticks.length) {
    return null;
  }
  const props = _objectSpread(_objectSpread(_objectSpread({}, defaultsAndInputs), {}, {
    scale
  }, viewBox), {}, {
    radius: viewBox.outerRadius
  });
  const {
    tick,
    axisLine
  } = props;
  return /*#__PURE__*/React.createElement(_Layer.Layer, {
    className: (0, _clsx.clsx)('recharts-polar-radius-axis', AXIS_TYPE, props.className)
  }, axisLine && renderAxisLine(props, ticks), tick && renderTicks(props, ticks), /*#__PURE__*/React.createElement(_Label.PolarLabelContextProvider, getViewBox(props.angle, props.cx, props.cy, ticks), /*#__PURE__*/React.createElement(_Label.PolarLabelFromLabelProp, {
    label: props.label
  }), props.children));
};
exports.PolarRadiusAxisWrapper = PolarRadiusAxisWrapper;
class PolarRadiusAxis extends _react.PureComponent {
  render() {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SetRadiusAxisSettings, {
      domain: this.props.domain,
      id: this.props.radiusAxisId,
      scale: this.props.scale,
      type: this.props.type,
      dataKey: this.props.dataKey,
      unit: undefined,
      name: this.props.name,
      allowDuplicatedCategory: this.props.allowDuplicatedCategory,
      allowDataOverflow: this.props.allowDataOverflow,
      reversed: this.props.reversed,
      includeHidden: this.props.includeHidden,
      allowDecimals: this.props.allowDecimals,
      tickCount: this.props.tickCount
      // @ts-expect-error the type does not match. Is RadiusAxis really expecting what it says?
      ,
      ticks: this.props.ticks,
      tick: this.props.tick
    }), /*#__PURE__*/React.createElement(PolarRadiusAxisWrapper, this.props));
  }
}
exports.PolarRadiusAxis = PolarRadiusAxis;
_defineProperty(PolarRadiusAxis, "displayName", 'PolarRadiusAxis');
_defineProperty(PolarRadiusAxis, "axisType", AXIS_TYPE);
_defineProperty(PolarRadiusAxis, "defaultProps", _defaultPolarRadiusAxisProps.defaultPolarRadiusAxisProps);
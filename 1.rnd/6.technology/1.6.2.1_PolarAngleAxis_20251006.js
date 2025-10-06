"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PolarAngleAxisWrapper = exports.PolarAngleAxis = void 0;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _clsx = require("clsx");
const _Layer = require("../container/Layer");
const _Dot = require("../shape/Dot");
const _Polygon = require("../shape/Polygon");
const _Text = require("../component/Text");
const _types = require("../util/types");
const _ReactUtils = require("../util/ReactUtils");
const _PolarUtils = require("../util/PolarUtils");
const _polarAxisSlice = require("../state/polarAxisSlice");
const _hooks = require("../state/hooks");
const _polarScaleSelectors = require("../state/selectors/polarScaleSelectors");
const _polarAxisSelectors = require("../state/selectors/polarAxisSelectors");
const _defaultPolarAngleAxisProps = require("./defaultPolarAngleAxisProps");
const _PanoramaContext = require("../context/PanoramaContext");
const _svgPropertiesNoEvents = require("../util/svgPropertiesNoEvents");
const _excluded = ["children"];
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
const eps = 1e-5;
const COS_45 = Math.cos((0, _PolarUtils.degreeToRadian)(45));

/**
 * These are injected from Redux, are required, but cannot be set by user.
 */

const AXIS_TYPE = 'angleAxis';
function SetAngleAxisSettings(props) {
  const dispatch = (0, _hooks.useAppDispatch)();
  const settings = (0, _react.useMemo)(() => {
    let {
        children
      } = props,
      rest = _objectWithoutProperties(props, _excluded);
    return rest;
  }, [props]);
  const synchronizedSettings = (0, _hooks.useAppSelector)(state => (0, _polarAxisSelectors.selectAngleAxis)(state, settings.id));
  const settingsAreSynchronized = settings === synchronizedSettings;
  (0, _react.useEffect)(() => {
    dispatch((0, _polarAxisSlice.addAngleAxis)(settings));
    return () => {
      dispatch((0, _polarAxisSlice.removeAngleAxis)(settings));
    };
  }, [dispatch, settings]);
  if (settingsAreSynchronized) {
    return props.children;
  }
  return null;
}

/**
 * Calculate the coordinate of line endpoint
 * @param data The data if there are ticks
 * @param props axis settings
 * @return (x1, y1): The point close to text,
 *         (x2, y2): The point close to axis
 */
const getTickLineCoord = (data, props) => {
  const {
    cx,
    cy,
    radius,
    orientation,
    tickSize
  } = props;
  const tickLineSize = tickSize || 8;
  const p1 = (0, _PolarUtils.polarToCartesian)(cx, cy, radius, data.coordinate);
  const p2 = (0, _PolarUtils.polarToCartesian)(cx, cy, radius + (orientation === 'inner' ? -1 : 1) * tickLineSize, data.coordinate);
  return {
    x1: p1.x,
    y1: p1.y,
    x2: p2.x,
    y2: p2.y
  };
};

/**
 * Get the text-anchor of each tick
 * @param data Data of ticks
 * @param orientation of the axis ticks
 * @return text-anchor
 */
const getTickTextAnchor = (data, orientation) => {
  const cos = Math.cos((0, _PolarUtils.degreeToRadian)(-data.coordinate));
  if (cos > eps) {
    return orientation === 'outer' ? 'start' : 'end';
  }
  if (cos < -eps) {
    return orientation === 'outer' ? 'end' : 'start';
  }
  return 'middle';
};

/**
 * Get the text vertical anchor of each tick
 * @param data Data of a tick
 * @return text vertical anchor
 */
const getTickTextVerticalAnchor = data => {
  const cos = Math.cos((0, _PolarUtils.degreeToRadian)(-data.coordinate));
  const sin = Math.sin((0, _PolarUtils.degreeToRadian)(-data.coordinate));

  // handle top and bottom sectors: 90±45deg and 270±45deg
  if (Math.abs(cos) <= COS_45) {
    // sin > 0: top sector, sin < 0: bottom sector
    return sin > 0 ? 'start' : 'end';
  }
  return 'middle';
};
const AxisLine = props => {
  const {
    cx,
    cy,
    radius,
    axisLineType,
    axisLine,
    ticks
  } = props;
  if (!axisLine) {
    return null;
  }
  const axisLineProps = _objectSpread(_objectSpread({}, (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(props)), {}, {
    fill: 'none'
  }, (0, _ReactUtils.filterProps)(axisLine, false));
  if (axisLineType === 'circle') {
    // @ts-expect-error wrong SVG element type
    return /*#__PURE__*/React.createElement(_Dot.Dot, _extends({
      className: "recharts-polar-angle-axis-line"
    }, axisLineProps, {
      cx: cx,
      cy: cy,
      r: radius
    }));
  }
  const points = ticks.map(entry => (0, _PolarUtils.polarToCartesian)(cx, cy, radius, entry.coordinate));

  // @ts-expect-error wrong SVG element type
  return /*#__PURE__*/React.createElement(_Polygon.Polygon, _extends({
    className: "recharts-polar-angle-axis-line"
  }, axisLineProps, {
    points: points
  }));
};
const TickItemText = _ref => {
  const {
    tick,
    tickProps,
    value
  } = _ref;
  if (!tick) {
    return null;
  }
  if (/*#__PURE__*/React.isValidElement(tick)) {
    // @ts-expect-error element cloning makes typescript unhappy and me too
    return /*#__PURE__*/React.cloneElement(tick, tickProps);
  }
  if (typeof tick === 'function') {
    return tick(tickProps);
  }
  return /*#__PURE__*/React.createElement(_Text.Text, _extends({}, tickProps, {
    className: "recharts-polar-angle-axis-tick-value"
  }), value);
};
const Ticks = props => {
  const {
    tick,
    tickLine,
    tickFormatter,
    stroke,
    ticks
  } = props;
  const axisProps = (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(props);
  const customTickProps = (0, _ReactUtils.filterProps)(tick, false);
  const tickLineProps = _objectSpread(_objectSpread({}, axisProps), {}, {
    fill: 'none'
  }, (0, _ReactUtils.filterProps)(tickLine, false));
  const items = ticks.map((entry, i) => {
    const lineCoord = getTickLineCoord(entry, props);
    const textAnchor = getTickTextAnchor(entry, props.orientation);
    const verticalAnchor = getTickTextVerticalAnchor(entry);
    const tickProps = _objectSpread(_objectSpread(_objectSpread({}, axisProps), {}, {
      textAnchor,
      verticalAnchor,
      stroke: 'none',
      fill: stroke
    }, customTickProps), {}, {
      index: i,
      payload: entry,
      x: lineCoord.x2,
      y: lineCoord.y2
    });
    return /*#__PURE__*/React.createElement(_Layer.Layer, _extends({
      className: (0, _clsx.clsx)('recharts-polar-angle-axis-tick', (0, _PolarUtils.getTickClassName)(tick)),
      key: "tick-".concat(entry.coordinate)
    }, (0, _types.adaptEventsOfChild)(props, entry, i)), tickLine && /*#__PURE__*/React.createElement("line", _extends({
      className: "recharts-polar-angle-axis-tick-line"
    }, tickLineProps, lineCoord)), /*#__PURE__*/React.createElement(TickItemText, {
      tick: tick,
      tickProps: tickProps,
      value: tickFormatter ? tickFormatter(entry.value, i) : entry.value
    }));
  });
  return /*#__PURE__*/React.createElement(_Layer.Layer, {
    className: "recharts-polar-angle-axis-ticks"
  }, items);
};
const PolarAngleAxisWrapper = defaultsAndInputs => {
  const {
    angleAxisId
  } = defaultsAndInputs;
  const viewBox = (0, _hooks.useAppSelector)(_polarAxisSelectors.selectPolarViewBox);
  const scale = (0, _hooks.useAppSelector)(state => (0, _polarScaleSelectors.selectPolarAxisScale)(state, 'angleAxis', angleAxisId));
  const isPanorama = (0, _PanoramaContext.useIsPanorama)();
  const ticks = (0, _hooks.useAppSelector)(state => (0, _polarScaleSelectors.selectPolarAxisTicks)(state, 'angleAxis', angleAxisId, isPanorama));
  if (viewBox == null || !ticks || !ticks.length) {
    return null;
  }
  const props = _objectSpread(_objectSpread(_objectSpread({}, defaultsAndInputs), {}, {
    scale
  }, viewBox), {}, {
    radius: viewBox.outerRadius
  });
  return /*#__PURE__*/React.createElement(_Layer.Layer, {
    className: (0, _clsx.clsx)('recharts-polar-angle-axis', AXIS_TYPE, props.className)
  }, /*#__PURE__*/React.createElement(AxisLine, _extends({}, props, {
    ticks: ticks
  })), /*#__PURE__*/React.createElement(Ticks, _extends({}, props, {
    ticks: ticks
  })));
};
exports.PolarAngleAxisWrapper = PolarAngleAxisWrapper;
class PolarAngleAxis extends _react.PureComponent {
  render() {
    if (this.props.radius <= 0) return null;
    return /*#__PURE__*/React.createElement(SetAngleAxisSettings, {
      id: this.props.angleAxisId,
      scale: this.props.scale,
      type: this.props.type,
      dataKey: this.props.dataKey,
      unit: undefined,
      name: this.props.name,
      allowDuplicatedCategory: false // Ignoring the prop on purpose because axis calculation behaves as if it was false and Tooltip requires it to be true.
      ,
      allowDataOverflow: false,
      reversed: this.props.reversed,
      includeHidden: false,
      allowDecimals: this.props.allowDecimals,
      tickCount: this.props.tickCount
      // @ts-expect-error the type does not match. Is RadiusAxis really expecting what it says?
      ,
      ticks: this.props.ticks,
      tick: this.props.tick,
      domain: this.props.domain
    }, /*#__PURE__*/React.createElement(PolarAngleAxisWrapper, this.props));
  }
}
exports.PolarAngleAxis = PolarAngleAxis;
_defineProperty(PolarAngleAxis, "displayName", 'PolarAngleAxis');
_defineProperty(PolarAngleAxis, "axisType", AXIS_TYPE);
_defineProperty(PolarAngleAxis, "defaultProps", _defaultPolarAngleAxisProps.defaultPolarAngleAxisProps);
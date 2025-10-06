"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultCartesianAxisProps = exports.CartesianAxis = void 0;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _get = _interopRequireDefault(require("es-toolkit/compat/get"));
const _clsx = require("clsx");
const _ShallowEqual = require("../util/ShallowEqual");
const _Layer = require("../container/Layer");
const _Text = require("../component/Text");
const _Label = require("../component/Label");
const _DataUtils = require("../util/DataUtils");
const _types = require("../util/types");
const _ReactUtils = require("../util/ReactUtils");
const _getTicks = require("./getTicks");
const _svgPropertiesNoEvents = require("../util/svgPropertiesNoEvents");
const _YAxisUtils = require("../util/YAxisUtils");
const _resolveDefaultProps = require("../util/resolveDefaultProps");
const _excluded = ["axisLine", "width", "height", "className", "hide", "ticks"],
  _excluded2 = ["viewBox"],
  _excluded3 = ["viewBox"];
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * @fileOverview Cartesian Axis
 */
/** The orientation of the axis in correspondence to the chart */

/** A unit to be appended to a value */

/** The formatter function of tick */

const defaultCartesianAxisProps = exports.defaultCartesianAxisProps = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  viewBox: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  // The orientation of axis
  orientation: 'bottom',
  // The ticks
  ticks: [],
  stroke: '#666',
  tickLine: true,
  axisLine: true,
  tick: true,
  mirror: false,
  minTickGap: 5,
  // The width or height of tick
  tickSize: 6,
  tickMargin: 2,
  interval: 'preserveEnd'
};

/*
 * `viewBox` and `scale` are SVG attributes.
 * Recharts however - unfortunately - has its own attributes named `viewBox` and `scale`
 * that are completely different data shape and different purpose.
 */

function AxisLine(axisLineProps) {
  const {
    x,
    y,
    width,
    height,
    orientation,
    mirror,
    axisLine,
    otherSvgProps
  } = axisLineProps;
  if (!axisLine) {
    return null;
  }
  let props = _objectSpread(_objectSpread(_objectSpread({}, otherSvgProps), (0, _ReactUtils.filterProps)(axisLine, false)), {}, {
    fill: 'none'
  });
  if (orientation === 'top' || orientation === 'bottom') {
    const needHeight = +(orientation === 'top' && !mirror || orientation === 'bottom' && mirror);
    props = _objectSpread(_objectSpread({}, props), {}, {
      x1: x,
      y1: y + needHeight * height,
      x2: x + width,
      y2: y + needHeight * height
    });
  } else {
    const needWidth = +(orientation === 'left' && !mirror || orientation === 'right' && mirror);
    props = _objectSpread(_objectSpread({}, props), {}, {
      x1: x + needWidth * width,
      y1: y,
      x2: x + needWidth * width,
      y2: y + height
    });
  }
  return /*#__PURE__*/React.createElement("line", _extends({}, props, {
    className: (0, _clsx.clsx)('recharts-cartesian-axis-line', (0, _get.default)(axisLine, 'className'))
  }));
}

/**
 * Calculate the coordinates of endpoints in ticks.
 * @param data The data of a simple tick.
 * @param x The x-coordinate of the axis.
 * @param y The y-coordinate of the axis.
 * @param width The width of the axis.
 * @param height The height of the axis.
 * @param orientation The orientation of the axis.
 * @param tickSize The length of the tick line.
 * @param mirror If true, the ticks are mirrored.
 * @param tickMargin The margin between the tick line and the tick text.
 * @returns An object with `line` and `tick` coordinates.
 * `line` is the coordinates for the tick line, and `tick` is the coordinate for the tick text.
 */
function getTickLineCoord(data, x, y, width, height, orientation, tickSize, mirror, tickMargin) {
  let x1, x2, y1, y2, tx, ty;
  const sign = mirror ? -1 : 1;
  const finalTickSize = data.tickSize || tickSize;
  const tickCoord = (0, _DataUtils.isNumber)(data.tickCoord) ? data.tickCoord : data.coordinate;
  switch (orientation) {
    case 'top':
      x1 = x2 = data.coordinate;
      y2 = y + +!mirror * height;
      y1 = y2 - sign * finalTickSize;
      ty = y1 - sign * tickMargin;
      tx = tickCoord;
      break;
    case 'left':
      y1 = y2 = data.coordinate;
      x2 = x + +!mirror * width;
      x1 = x2 - sign * finalTickSize;
      tx = x1 - sign * tickMargin;
      ty = tickCoord;
      break;
    case 'right':
      y1 = y2 = data.coordinate;
      x2 = x + +mirror * width;
      x1 = x2 + sign * finalTickSize;
      tx = x1 + sign * tickMargin;
      ty = tickCoord;
      break;
    default:
      x1 = x2 = data.coordinate;
      y2 = y + +mirror * height;
      y1 = y2 + sign * finalTickSize;
      ty = y1 + sign * tickMargin;
      tx = tickCoord;
      break;
  }
  return {
    line: {
      x1,
      y1,
      x2,
      y2
    },
    tick: {
      x: tx,
      y: ty
    }
  };
}

/**
 * @param orientation The orientation of the axis.
 * @param mirror If true, the ticks are mirrored.
 * @returns The text anchor of the tick.
 */
function getTickTextAnchor(orientation, mirror) {
  switch (orientation) {
    case 'left':
      return mirror ? 'start' : 'end';
    case 'right':
      return mirror ? 'end' : 'start';
    default:
      return 'middle';
  }
}

/**
 * @param orientation The orientation of the axis.
 * @param mirror If true, the ticks are mirrored.
 * @returns The vertical text anchor of the tick.
 */
function getTickVerticalAnchor(orientation, mirror) {
  switch (orientation) {
    case 'left':
    case 'right':
      return 'middle';
    case 'top':
      return mirror ? 'start' : 'end';
    default:
      return mirror ? 'end' : 'start';
  }
}
function TickItem(props) {
  const {
    option,
    tickProps,
    value
  } = props;
  let tickItem;
  const combinedClassName = (0, _clsx.clsx)(tickProps.className, 'recharts-cartesian-axis-tick-value');
  if (/*#__PURE__*/React.isValidElement(option)) {
    // @ts-expect-error element cloning is not typed
    tickItem = /*#__PURE__*/React.cloneElement(option, _objectSpread(_objectSpread({}, tickProps), {}, {
      className: combinedClassName
    }));
  } else if (typeof option === 'function') {
    tickItem = option(_objectSpread(_objectSpread({}, tickProps), {}, {
      className: combinedClassName
    }));
  } else {
    let className = 'recharts-cartesian-axis-tick-value';
    if (typeof option !== 'boolean') {
      className = (0, _clsx.clsx)(className, option === null || option === void 0 ? void 0 : option.className);
    }
    tickItem = /*#__PURE__*/React.createElement(_Text.Text, _extends({}, tickProps, {
      className: className
    }), value);
  }
  return tickItem;
}
function Ticks(props) {
  const {
    ticks = [],
    tick,
    tickLine,
    stroke,
    tickFormatter,
    unit,
    padding,
    tickTextProps,
    orientation,
    mirror,
    x,
    y,
    width,
    height,
    tickSize,
    tickMargin,
    fontSize,
    letterSpacing,
    getTicksConfig,
    events
  } = props;
  // @ts-expect-error some properties are optional in props but required in getTicks
  const finalTicks = (0, _getTicks.getTicks)(_objectSpread(_objectSpread({}, getTicksConfig), {}, {
    ticks
  }), fontSize, letterSpacing);
  const textAnchor = getTickTextAnchor(orientation, mirror);
  const verticalAnchor = getTickVerticalAnchor(orientation, mirror);
  const axisProps = (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(getTicksConfig);
  const customTickProps = (0, _ReactUtils.filterProps)(tick, false);
  const tickLineProps = _objectSpread(_objectSpread({}, axisProps), {}, {
    fill: 'none'
  }, (0, _ReactUtils.filterProps)(tickLine, false));
  const items = finalTicks.map((entry, i) => {
    const {
      line: lineCoord,
      tick: tickCoord
    } = getTickLineCoord(entry, x, y, width, height, orientation, tickSize, mirror, tickMargin);
    const tickProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread({
      // @ts-expect-error textAnchor from axisProps is typed as `string` but Text wants type `TextAnchor`
      textAnchor,
      verticalAnchor
    }, axisProps), {}, {
      stroke: 'none',
      fill: stroke
    }, customTickProps), tickCoord), {}, {
      index: i,
      payload: entry,
      visibleTicksCount: finalTicks.length,
      tickFormatter,
      padding
    }, tickTextProps);
    return /*#__PURE__*/React.createElement(_Layer.Layer, _extends({
      className: "recharts-cartesian-axis-tick",
      key: "tick-".concat(entry.value, "-").concat(entry.coordinate, "-").concat(entry.tickCoord)
    }, (0, _types.adaptEventsOfChild)(events, entry, i)), tickLine &&
    /*#__PURE__*/
    // @ts-expect-error recharts scale is not compatible with SVG scale
    React.createElement("line", _extends({}, tickLineProps, lineCoord, {
      className: (0, _clsx.clsx)('recharts-cartesian-axis-tick-line', (0, _get.default)(tickLine, 'className'))
    })), tick && /*#__PURE__*/React.createElement(TickItem, {
      option: tick,
      tickProps: tickProps,
      value: "".concat(typeof tickFormatter === 'function' ? tickFormatter(entry.value, i) : entry.value).concat(unit || '')
    }));
  });
  if (items.length > 0) {
    return /*#__PURE__*/React.createElement("g", {
      className: "recharts-cartesian-axis-ticks"
    }, items);
  }
  return null;
}
const CartesianAxisComponent = /*#__PURE__*/(0, _react.forwardRef)((props, ref) => {
  let {
      axisLine,
      width,
      height,
      className,
      hide,
      ticks
    } = props,
    rest = _objectWithoutProperties(props, _excluded);
  const [fontSize, setFontSize] = (0, _react.useState)('');
  const [letterSpacing, setLetterSpacing] = (0, _react.useState)('');
  const tickRefs = (0, _react.useRef)([]);
  (0, _react.useImperativeHandle)(ref, () => ({
    getCalculatedWidth: () => {
      let _props$labelRef;
      return (0, _YAxisUtils.getCalculatedYAxisWidth)({
        ticks: tickRefs.current,
        label: (_props$labelRef = props.labelRef) === null || _props$labelRef === void 0 ? void 0 : _props$labelRef.current,
        labelGapWithTick: 5,
        tickSize: props.tickSize,
        tickMargin: props.tickMargin
      });
    }
  }));
  const layerRef = (0, _react.useCallback)(el => {
    if (el) {
      const tickNodes = el.getElementsByClassName('recharts-cartesian-axis-tick-value');
      tickRefs.current = Array.from(tickNodes);
      const tick = tickNodes[0];
      if (tick) {
        const computedStyle = window.getComputedStyle(tick);
        const calculatedFontSize = computedStyle.fontSize;
        const calculatedLetterSpacing = computedStyle.letterSpacing;
        if (calculatedFontSize !== fontSize || calculatedLetterSpacing !== letterSpacing) {
          setFontSize(calculatedFontSize);
          setLetterSpacing(calculatedLetterSpacing);
        }
      }
    }
  }, [fontSize, letterSpacing]);
  if (hide) {
    return null;
  }

  /*
   * This is different condition from what validateWidthHeight is doing;
   * the CartesianAxis does allow width or height to be undefined.
   */
  if (width != null && width <= 0 || height != null && height <= 0) {
    return null;
  }
  return /*#__PURE__*/React.createElement(_Layer.Layer, {
    className: (0, _clsx.clsx)('recharts-cartesian-axis', className),
    ref: layerRef
  }, /*#__PURE__*/React.createElement(AxisLine, {
    x: props.x,
    y: props.y,
    width: width,
    height: height,
    orientation: props.orientation,
    mirror: props.mirror,
    axisLine: axisLine,
    otherSvgProps: (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(props)
  }), /*#__PURE__*/React.createElement(Ticks, {
    ticks: ticks,
    tick: props.tick,
    tickLine: props.tickLine,
    stroke: props.stroke,
    tickFormatter: props.tickFormatter,
    unit: props.unit,
    padding: props.padding,
    tickTextProps: props.tickTextProps,
    orientation: props.orientation,
    mirror: props.mirror,
    x: props.x,
    y: props.y,
    width: props.width,
    height: props.height,
    tickSize: props.tickSize,
    tickMargin: props.tickMargin,
    fontSize: fontSize,
    letterSpacing: letterSpacing,
    getTicksConfig: props,
    events: rest
  }), /*#__PURE__*/React.createElement(_Label.CartesianLabelContextProvider, {
    x: props.x,
    y: props.y,
    width: props.width,
    height: props.height
  }, /*#__PURE__*/React.createElement(_Label.CartesianLabelFromLabelProp, {
    label: props.label
  }), props.children));
});
const MemoCartesianAxis = /*#__PURE__*/React.memo(CartesianAxisComponent, (prevProps, nextProps) => {
  let {
      viewBox: prevViewBox
    } = prevProps,
    prevRestProps = _objectWithoutProperties(prevProps, _excluded2);
  let {
      viewBox: nextViewBox
    } = nextProps,
    nextRestProps = _objectWithoutProperties(nextProps, _excluded3);
  return (0, _ShallowEqual.shallowEqual)(prevViewBox, nextViewBox) && (0, _ShallowEqual.shallowEqual)(prevRestProps, nextRestProps);
});
const CartesianAxis = exports.CartesianAxis = /*#__PURE__*/React.forwardRef((outsideProps, ref) => {
  const props = (0, _resolveDefaultProps.resolveDefaultProps)(outsideProps, defaultCartesianAxisProps);
  return /*#__PURE__*/React.createElement(MemoCartesianAxis, _extends({}, props, {
    ref: ref
  }));
});
CartesianAxis.displayName = 'CartesianAxis';
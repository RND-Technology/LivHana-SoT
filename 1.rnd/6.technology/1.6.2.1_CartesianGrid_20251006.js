"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CartesianGrid = CartesianGrid;
const React = _interopRequireWildcard(require("react"));
const _LogUtils = require("../util/LogUtils");
const _DataUtils = require("../util/DataUtils");
const _ChartUtils = require("../util/ChartUtils");
const _getTicks = require("./getTicks");
const _CartesianAxis = require("./CartesianAxis");
const _chartLayoutContext = require("../context/chartLayoutContext");
const _axisSelectors = require("../state/selectors/axisSelectors");
const _hooks = require("../state/hooks");
const _PanoramaContext = require("../context/PanoramaContext");
const _resolveDefaultProps = require("../util/resolveDefaultProps");
const _svgPropertiesNoEvents = require("../util/svgPropertiesNoEvents");
const _excluded = ["x1", "y1", "x2", "y2", "key"],
  _excluded2 = ["offset"],
  _excluded3 = ["xAxisId", "yAxisId"],
  _excluded4 = ["xAxisId", "yAxisId"];
/**
 * @fileOverview Cartesian Grid
 */
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
/**
 * The <CartesianGrid horizontal
 */

const Background = props => {
  const {
    fill
  } = props;
  if (!fill || fill === 'none') {
    return null;
  }
  const {
    fillOpacity,
    x,
    y,
    width,
    height,
    ry
  } = props;
  return /*#__PURE__*/React.createElement("rect", {
    x: x,
    y: y,
    ry: ry,
    width: width,
    height: height,
    stroke: "none",
    fill: fill,
    fillOpacity: fillOpacity,
    className: "recharts-cartesian-grid-bg"
  });
};
function renderLineItem(option, props) {
  let lineItem;
  if (/*#__PURE__*/React.isValidElement(option)) {
    // @ts-expect-error typescript does not see the props type when cloning an element
    lineItem = /*#__PURE__*/React.cloneElement(option, props);
  } else if (typeof option === 'function') {
    lineItem = option(props);
  } else {
    let {
        x1,
        y1,
        x2,
        y2,
        key
      } = props,
      others = _objectWithoutProperties(props, _excluded);
    const _svgPropertiesNoEvent = (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(others),
      {
        offset: __
      } = _svgPropertiesNoEvent,
      restOfFilteredProps = _objectWithoutProperties(_svgPropertiesNoEvent, _excluded2);
    lineItem = /*#__PURE__*/React.createElement("line", _extends({}, restOfFilteredProps, {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      fill: "none",
      key: key
    }));
  }
  return lineItem;
}
function HorizontalGridLines(props) {
  const {
    x,
    width,
    horizontal = true,
    horizontalPoints
  } = props;
  if (!horizontal || !horizontalPoints || !horizontalPoints.length) {
    return null;
  }
  let {
      xAxisId,
      yAxisId
    } = props,
    otherLineItemProps = _objectWithoutProperties(props, _excluded3);
  const items = horizontalPoints.map((entry, i) => {
    const lineItemProps = _objectSpread(_objectSpread({}, otherLineItemProps), {}, {
      x1: x,
      y1: entry,
      x2: x + width,
      y2: entry,
      key: "line-".concat(i),
      index: i
    });
    return renderLineItem(horizontal, lineItemProps);
  });
  return /*#__PURE__*/React.createElement("g", {
    className: "recharts-cartesian-grid-horizontal"
  }, items);
}
function VerticalGridLines(props) {
  const {
    y,
    height,
    vertical = true,
    verticalPoints
  } = props;
  if (!vertical || !verticalPoints || !verticalPoints.length) {
    return null;
  }
  let {
      xAxisId,
      yAxisId
    } = props,
    otherLineItemProps = _objectWithoutProperties(props, _excluded4);
  const items = verticalPoints.map((entry, i) => {
    const lineItemProps = _objectSpread(_objectSpread({}, otherLineItemProps), {}, {
      x1: entry,
      y1: y,
      x2: entry,
      y2: y + height,
      key: "line-".concat(i),
      index: i
    });
    return renderLineItem(vertical, lineItemProps);
  });
  return /*#__PURE__*/React.createElement("g", {
    className: "recharts-cartesian-grid-vertical"
  }, items);
}
function HorizontalStripes(props) {
  const {
    horizontalFill,
    fillOpacity,
    x,
    y,
    width,
    height,
    horizontalPoints,
    horizontal = true
  } = props;
  if (!horizontal || !horizontalFill || !horizontalFill.length) {
    return null;
  }

  // Why =y -y? I was trying to find any difference that this makes, with floating point numbers and edge cases but ... nothing.
  const roundedSortedHorizontalPoints = horizontalPoints.map(e => Math.round(e + y - y)).sort((a, b) => a - b);
  // Why is this condition `!==` instead of `<=` ?
  if (y !== roundedSortedHorizontalPoints[0]) {
    roundedSortedHorizontalPoints.unshift(0);
  }
  const items = roundedSortedHorizontalPoints.map((entry, i) => {
    // Why do we strip only the last stripe if it is invisible, and not all invisible stripes?
    const lastStripe = !roundedSortedHorizontalPoints[i + 1];
    const lineHeight = lastStripe ? y + height - entry : roundedSortedHorizontalPoints[i + 1] - entry;
    if (lineHeight <= 0) {
      return null;
    }
    const colorIndex = i % horizontalFill.length;
    return /*#__PURE__*/React.createElement("rect", {
      key: "react-".concat(i) // eslint-disable-line react/no-array-index-key
      ,
      y: entry,
      x: x,
      height: lineHeight,
      width: width,
      stroke: "none",
      fill: horizontalFill[colorIndex],
      fillOpacity: fillOpacity,
      className: "recharts-cartesian-grid-bg"
    });
  });
  return /*#__PURE__*/React.createElement("g", {
    className: "recharts-cartesian-gridstripes-horizontal"
  }, items);
}
function VerticalStripes(props) {
  const {
    vertical = true,
    verticalFill,
    fillOpacity,
    x,
    y,
    width,
    height,
    verticalPoints
  } = props;
  if (!vertical || !verticalFill || !verticalFill.length) {
    return null;
  }
  const roundedSortedVerticalPoints = verticalPoints.map(e => Math.round(e + x - x)).sort((a, b) => a - b);
  if (x !== roundedSortedVerticalPoints[0]) {
    roundedSortedVerticalPoints.unshift(0);
  }
  const items = roundedSortedVerticalPoints.map((entry, i) => {
    const lastStripe = !roundedSortedVerticalPoints[i + 1];
    const lineWidth = lastStripe ? x + width - entry : roundedSortedVerticalPoints[i + 1] - entry;
    if (lineWidth <= 0) {
      return null;
    }
    const colorIndex = i % verticalFill.length;
    return /*#__PURE__*/React.createElement("rect", {
      key: "react-".concat(i) // eslint-disable-line react/no-array-index-key
      ,
      x: entry,
      y: y,
      width: lineWidth,
      height: height,
      stroke: "none",
      fill: verticalFill[colorIndex],
      fillOpacity: fillOpacity,
      className: "recharts-cartesian-grid-bg"
    });
  });
  return /*#__PURE__*/React.createElement("g", {
    className: "recharts-cartesian-gridstripes-vertical"
  }, items);
}
const defaultVerticalCoordinatesGenerator = (_ref, syncWithTicks) => {
  const {
    xAxis,
    width,
    height,
    offset
  } = _ref;
  return (0, _ChartUtils.getCoordinatesOfGrid)((0, _getTicks.getTicks)(_objectSpread(_objectSpread(_objectSpread({}, _CartesianAxis.defaultCartesianAxisProps), xAxis), {}, {
    ticks: (0, _ChartUtils.getTicksOfAxis)(xAxis, true),
    viewBox: {
      x: 0,
      y: 0,
      width,
      height
    }
  })), offset.left, offset.left + offset.width, syncWithTicks);
};
const defaultHorizontalCoordinatesGenerator = (_ref2, syncWithTicks) => {
  const {
    yAxis,
    width,
    height,
    offset
  } = _ref2;
  return (0, _ChartUtils.getCoordinatesOfGrid)((0, _getTicks.getTicks)(_objectSpread(_objectSpread(_objectSpread({}, _CartesianAxis.defaultCartesianAxisProps), yAxis), {}, {
    ticks: (0, _ChartUtils.getTicksOfAxis)(yAxis, true),
    viewBox: {
      x: 0,
      y: 0,
      width,
      height
    }
  })), offset.top, offset.top + offset.height, syncWithTicks);
};
const defaultProps = {
  horizontal: true,
  vertical: true,
  // The ordinates of horizontal grid lines
  horizontalPoints: [],
  // The abscissas of vertical grid lines
  verticalPoints: [],
  stroke: '#ccc',
  fill: 'none',
  // The fill of colors of grid lines
  verticalFill: [],
  horizontalFill: [],
  xAxisId: 0,
  yAxisId: 0
};
function CartesianGrid(props) {
  const chartWidth = (0, _chartLayoutContext.useChartWidth)();
  const chartHeight = (0, _chartLayoutContext.useChartHeight)();
  const offset = (0, _chartLayoutContext.useOffsetInternal)();
  const propsIncludingDefaults = _objectSpread(_objectSpread({}, (0, _resolveDefaultProps.resolveDefaultProps)(props, defaultProps)), {}, {
    x: (0, _DataUtils.isNumber)(props.x) ? props.x : offset.left,
    y: (0, _DataUtils.isNumber)(props.y) ? props.y : offset.top,
    width: (0, _DataUtils.isNumber)(props.width) ? props.width : offset.width,
    height: (0, _DataUtils.isNumber)(props.height) ? props.height : offset.height
  });
  const {
    xAxisId,
    yAxisId,
    x,
    y,
    width,
    height,
    syncWithTicks,
    horizontalValues,
    verticalValues
  } = propsIncludingDefaults;
  const isPanorama = (0, _PanoramaContext.useIsPanorama)();
  const xAxis = (0, _hooks.useAppSelector)(state => (0, _axisSelectors.selectAxisPropsNeededForCartesianGridTicksGenerator)(state, 'xAxis', xAxisId, isPanorama));
  const yAxis = (0, _hooks.useAppSelector)(state => (0, _axisSelectors.selectAxisPropsNeededForCartesianGridTicksGenerator)(state, 'yAxis', yAxisId, isPanorama));
  if (!(0, _DataUtils.isNumber)(width) || width <= 0 || !(0, _DataUtils.isNumber)(height) || height <= 0 || !(0, _DataUtils.isNumber)(x) || x !== +x || !(0, _DataUtils.isNumber)(y) || y !== +y) {
    return null;
  }

  /*
   * verticalCoordinatesGenerator and horizontalCoordinatesGenerator are defined
   * outside the propsIncludingDefaults because they were never part of the original props
   * and they were never passed as a prop down to horizontal/vertical custom elements.
   * If we add these two to propsIncludingDefaults then we are changing public API.
   * Not a bad thing per se but also not necessary.
   */
  const verticalCoordinatesGenerator = propsIncludingDefaults.verticalCoordinatesGenerator || defaultVerticalCoordinatesGenerator;
  const horizontalCoordinatesGenerator = propsIncludingDefaults.horizontalCoordinatesGenerator || defaultHorizontalCoordinatesGenerator;
  let {
    horizontalPoints,
    verticalPoints
  } = propsIncludingDefaults;

  // No horizontal points are specified
  if ((!horizontalPoints || !horizontalPoints.length) && typeof horizontalCoordinatesGenerator === 'function') {
    const isHorizontalValues = horizontalValues && horizontalValues.length;
    const generatorResult = horizontalCoordinatesGenerator({
      yAxis: yAxis ? _objectSpread(_objectSpread({}, yAxis), {}, {
        ticks: isHorizontalValues ? horizontalValues : yAxis.ticks
      }) : undefined,
      width: chartWidth,
      height: chartHeight,
      offset
    }, isHorizontalValues ? true : syncWithTicks);
    (0, _LogUtils.warn)(Array.isArray(generatorResult), "horizontalCoordinatesGenerator should return Array but instead it returned [".concat(typeof generatorResult, "]"));
    if (Array.isArray(generatorResult)) {
      horizontalPoints = generatorResult;
    }
  }

  // No vertical points are specified
  if ((!verticalPoints || !verticalPoints.length) && typeof verticalCoordinatesGenerator === 'function') {
    const isVerticalValues = verticalValues && verticalValues.length;
    const _generatorResult = verticalCoordinatesGenerator({
      xAxis: xAxis ? _objectSpread(_objectSpread({}, xAxis), {}, {
        ticks: isVerticalValues ? verticalValues : xAxis.ticks
      }) : undefined,
      width: chartWidth,
      height: chartHeight,
      offset
    }, isVerticalValues ? true : syncWithTicks);
    (0, _LogUtils.warn)(Array.isArray(_generatorResult), "verticalCoordinatesGenerator should return Array but instead it returned [".concat(typeof _generatorResult, "]"));
    if (Array.isArray(_generatorResult)) {
      verticalPoints = _generatorResult;
    }
  }
  return /*#__PURE__*/React.createElement("g", {
    className: "recharts-cartesian-grid"
  }, /*#__PURE__*/React.createElement(Background, {
    fill: propsIncludingDefaults.fill,
    fillOpacity: propsIncludingDefaults.fillOpacity,
    x: propsIncludingDefaults.x,
    y: propsIncludingDefaults.y,
    width: propsIncludingDefaults.width,
    height: propsIncludingDefaults.height,
    ry: propsIncludingDefaults.ry
  }), /*#__PURE__*/React.createElement(HorizontalStripes, _extends({}, propsIncludingDefaults, {
    horizontalPoints: horizontalPoints
  })), /*#__PURE__*/React.createElement(VerticalStripes, _extends({}, propsIncludingDefaults, {
    verticalPoints: verticalPoints
  })), /*#__PURE__*/React.createElement(HorizontalGridLines, _extends({}, propsIncludingDefaults, {
    offset: offset,
    horizontalPoints: horizontalPoints,
    xAxis: xAxis,
    yAxis: yAxis
  })), /*#__PURE__*/React.createElement(VerticalGridLines, _extends({}, propsIncludingDefaults, {
    offset: offset,
    verticalPoints: verticalPoints,
    xAxis: xAxis,
    yAxis: yAxis
  })));
}
CartesianGrid.displayName = 'CartesianGrid';
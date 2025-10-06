"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PolarChart = void 0;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _RechartsStoreProvider = require("../state/RechartsStoreProvider");
const _chartDataContext = require("../context/chartDataContext");
const _ReportMainChartProps = require("../state/ReportMainChartProps");
const _ReportChartProps = require("../state/ReportChartProps");
const _ReportPolarOptions = require("../state/ReportPolarOptions");
const _CategoricalChart = require("./CategoricalChart");
const _resolveDefaultProps = require("../util/resolveDefaultProps");
const _isWellBehavedNumber = require("../util/isWellBehavedNumber");
const _excluded = ["width", "height", "layout"];
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
const defaultMargin = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5
};

/**
 * These default props are the same for all PolarChart components.
 */
const defaultProps = {
  accessibilityLayer: true,
  stackOffset: 'none',
  barCategoryGap: '10%',
  barGap: 4,
  margin: defaultMargin,
  reverseStackOrder: false,
  syncMethod: 'index',
  layout: 'radial'
};

/**
 * These props are required for the PolarChart to function correctly.
 * Users usually would not need to specify these explicitly,
 * because the convenience components like PieChart, RadarChart, etc.
 * will provide these defaults.
 * We can't have the defaults in this file because each of those convenience components
 * have their own opinions about what they should be.
 */

/**
 * These are one-time, immutable options that decide the chart's behavior.
 * Users who wish to call CartesianChart may decide to pass these options explicitly,
 * but usually we would expect that they use one of the convenience components like PieChart, RadarChart, etc.
 */

const PolarChart = exports.PolarChart = /*#__PURE__*/(0, _react.forwardRef)(function PolarChart(props, ref) {
  let _polarChartProps$id;
  const polarChartProps = (0, _resolveDefaultProps.resolveDefaultProps)(props.categoricalChartProps, defaultProps);
  let {
      width,
      height,
      layout
    } = polarChartProps,
    otherCategoricalProps = _objectWithoutProperties(polarChartProps, _excluded);
  if (!(0, _isWellBehavedNumber.isPositiveNumber)(width) || !(0, _isWellBehavedNumber.isPositiveNumber)(height)) {
    return null;
  }
  const {
    chartName,
    defaultTooltipEventType,
    validateTooltipEventTypes,
    tooltipPayloadSearcher
  } = props;
  const options = {
    chartName,
    defaultTooltipEventType,
    validateTooltipEventTypes,
    tooltipPayloadSearcher,
    eventEmitter: undefined
  };
  return /*#__PURE__*/React.createElement(_RechartsStoreProvider.RechartsStoreProvider, {
    preloadedState: {
      options
    },
    reduxStoreName: (_polarChartProps$id = polarChartProps.id) !== null && _polarChartProps$id !== void 0 ? _polarChartProps$id : chartName
  }, /*#__PURE__*/React.createElement(_chartDataContext.ChartDataContextProvider, {
    chartData: polarChartProps.data
  }), /*#__PURE__*/React.createElement(_ReportMainChartProps.ReportMainChartProps, {
    width: width,
    height: height,
    layout: layout,
    margin: polarChartProps.margin
  }), /*#__PURE__*/React.createElement(_ReportChartProps.ReportChartProps, {
    accessibilityLayer: polarChartProps.accessibilityLayer,
    barCategoryGap: polarChartProps.barCategoryGap,
    maxBarSize: polarChartProps.maxBarSize,
    stackOffset: polarChartProps.stackOffset,
    barGap: polarChartProps.barGap,
    barSize: polarChartProps.barSize,
    syncId: polarChartProps.syncId,
    syncMethod: polarChartProps.syncMethod,
    className: polarChartProps.className
  }), /*#__PURE__*/React.createElement(_ReportPolarOptions.ReportPolarOptions, {
    cx: polarChartProps.cx,
    cy: polarChartProps.cy,
    startAngle: polarChartProps.startAngle,
    endAngle: polarChartProps.endAngle,
    innerRadius: polarChartProps.innerRadius,
    outerRadius: polarChartProps.outerRadius
  }), /*#__PURE__*/React.createElement(_CategoricalChart.CategoricalChart, _extends({
    width: width,
    height: height
  }, otherCategoricalProps, {
    ref: ref
  })));
});
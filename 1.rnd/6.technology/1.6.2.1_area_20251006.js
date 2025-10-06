"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Area = void 0;
exports.computeArea = computeArea;
exports.getBaseValue = void 0;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _clsx = require("clsx");
const _Curve = require("../shape/Curve");
const _Dot = require("../shape/Dot");
const _Layer = require("../container/Layer");
const _LabelList = require("../component/LabelList");
const _Global = require("../util/Global");
const _DataUtils = require("../util/DataUtils");
const _ChartUtils = require("../util/ChartUtils");
const _ReactUtils = require("../util/ReactUtils");
const _ActivePoints = require("../component/ActivePoints");
const _SetTooltipEntrySettings = require("../state/SetTooltipEntrySettings");
const _GraphicalItemClipPath = require("./GraphicalItemClipPath");
const _areaSelectors = require("../state/selectors/areaSelectors");
const _PanoramaContext = require("../context/PanoramaContext");
const _chartLayoutContext = require("../context/chartLayoutContext");
const _selectors = require("../state/selectors/selectors");
const _SetLegendPayload = require("../state/SetLegendPayload");
const _hooks = require("../state/hooks");
const _useAnimationId = require("../util/useAnimationId");
const _resolveDefaultProps2 = require("../util/resolveDefaultProps");
const _isWellBehavedNumber = require("../util/isWellBehavedNumber");
const _hooks2 = require("../hooks");
const _RegisterGraphicalItemId = require("../context/RegisterGraphicalItemId");
const _SetGraphicalItem = require("../state/SetGraphicalItem");
const _svgPropertiesNoEvents = require("../util/svgPropertiesNoEvents");
const _JavascriptAnimate = require("../animation/JavascriptAnimate");
const _excluded = ["id"],
  _excluded2 = ["activeDot", "animationBegin", "animationDuration", "animationEasing", "connectNulls", "dot", "fill", "fillOpacity", "hide", "isAnimationActive", "legendType", "stroke", "xAxisId", "yAxisId"];
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Internal props, combination of external props + defaultProps + private Recharts state
 */

/**
 * External props, intended for end users to fill in
 */

/**
 * Because of naming conflict, we are forced to ignore certain (valid) SVG attributes.
 */

function getLegendItemColor(stroke, fill) {
  return stroke && stroke !== 'none' ? stroke : fill;
}
const computeLegendPayloadFromAreaData = props => {
  const {
    dataKey,
    name,
    stroke,
    fill,
    legendType,
    hide
  } = props;
  return [{
    inactive: hide,
    dataKey,
    type: legendType,
    color: getLegendItemColor(stroke, fill),
    value: (0, _ChartUtils.getTooltipNameProp)(name, dataKey),
    payload: props
  }];
};
function getTooltipEntrySettings(props) {
  const {
    dataKey,
    data,
    stroke,
    strokeWidth,
    fill,
    name,
    hide,
    unit
  } = props;
  return {
    dataDefinedOnItem: data,
    positions: undefined,
    settings: {
      stroke,
      strokeWidth,
      fill,
      dataKey,
      nameKey: undefined,
      name: (0, _ChartUtils.getTooltipNameProp)(name, dataKey),
      hide,
      type: props.tooltipType,
      color: getLegendItemColor(stroke, fill),
      unit
    }
  };
}
const renderDotItem = (option, props) => {
  let dotItem;
  if (/*#__PURE__*/React.isValidElement(option)) {
    dotItem = /*#__PURE__*/React.cloneElement(option, props);
  } else if (typeof option === 'function') {
    dotItem = option(props);
  } else {
    const className = (0, _clsx.clsx)('recharts-area-dot', typeof option !== 'boolean' ? option.className : '');
    dotItem = /*#__PURE__*/React.createElement(_Dot.Dot, _extends({}, props, {
      className: className
    }));
  }
  return dotItem;
};
function shouldRenderDots(points, dot) {
  if (points == null) {
    return false;
  }
  if (dot) {
    return true;
  }
  return points.length === 1;
}
function Dots(_ref) {
  const {
    clipPathId,
    points,
    props
  } = _ref;
  const {
    needClip,
    dot,
    dataKey
  } = props;
  if (!shouldRenderDots(points, dot)) {
    return null;
  }
  const clipDot = (0, _ReactUtils.isClipDot)(dot);
  const areaProps = (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(props);
  const customDotProps = (0, _ReactUtils.filterProps)(dot, true);
  const dots = points.map((entry, i) => {
    const dotProps = _objectSpread(_objectSpread(_objectSpread({
      key: "dot-".concat(i),
      r: 3
    }, areaProps), customDotProps), {}, {
      index: i,
      cx: entry.x,
      cy: entry.y,
      dataKey,
      value: entry.value,
      payload: entry.payload,
      points
    });
    return renderDotItem(dot, dotProps);
  });
  const dotsProps = {
    clipPath: needClip ? "url(#clipPath-".concat(clipDot ? '' : 'dots-').concat(clipPathId, ")") : undefined
  };
  return /*#__PURE__*/React.createElement(_Layer.Layer, _extends({
    className: "recharts-area-dots"
  }, dotsProps), dots);
}
function AreaLabelListProvider(_ref2) {
  const {
    showLabels,
    children,
    points
  } = _ref2;
  const labelListEntries = points.map(point => {
    const viewBox = {
      x: point.x,
      y: point.y,
      width: 0,
      height: 0
    };
    return _objectSpread(_objectSpread({}, viewBox), {}, {
      value: point.value,
      payload: point.payload,
      parentViewBox: undefined,
      viewBox,
      fill: undefined
    });
  });
  return /*#__PURE__*/React.createElement(_LabelList.CartesianLabelListContextProvider, {
    value: showLabels ? labelListEntries : null
  }, children);
}
function StaticArea(_ref3) {
  const {
    points,
    baseLine,
    needClip,
    clipPathId,
    props
  } = _ref3;
  const {
    layout,
    type,
    stroke,
    connectNulls,
    isRange
  } = props;
  let {
      id
    } = props,
    propsWithoutId = _objectWithoutProperties(props, _excluded);
  const allOtherProps = (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(propsWithoutId);
  return /*#__PURE__*/React.createElement(React.Fragment, null, (points === null || points === void 0 ? void 0 : points.length) > 1 && /*#__PURE__*/React.createElement(_Layer.Layer, {
    clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : undefined
  }, /*#__PURE__*/React.createElement(_Curve.Curve, _extends({}, allOtherProps, {
    id: id,
    points: points,
    connectNulls: connectNulls,
    type: type,
    baseLine: baseLine,
    layout: layout,
    stroke: "none",
    className: "recharts-area-area"
  })), stroke !== 'none' && /*#__PURE__*/React.createElement(_Curve.Curve, _extends({}, allOtherProps, {
    className: "recharts-area-curve",
    layout: layout,
    type: type,
    connectNulls: connectNulls,
    fill: "none",
    points: points
  })), stroke !== 'none' && isRange && /*#__PURE__*/React.createElement(_Curve.Curve, _extends({}, allOtherProps, {
    className: "recharts-area-curve",
    layout: layout,
    type: type,
    connectNulls: connectNulls,
    fill: "none",
    points: baseLine
  }))), /*#__PURE__*/React.createElement(Dots, {
    points: points,
    props: propsWithoutId,
    clipPathId: clipPathId
  }));
}
function VerticalRect(_ref4) {
  const {
    alpha,
    baseLine,
    points,
    strokeWidth
  } = _ref4;
  const startY = points[0].y;
  const endY = points[points.length - 1].y;
  if (!(0, _isWellBehavedNumber.isWellBehavedNumber)(startY) || !(0, _isWellBehavedNumber.isWellBehavedNumber)(endY)) {
    return null;
  }
  const height = alpha * Math.abs(startY - endY);
  let maxX = Math.max(...points.map(entry => entry.x || 0));
  if ((0, _DataUtils.isNumber)(baseLine)) {
    maxX = Math.max(baseLine, maxX);
  } else if (baseLine && Array.isArray(baseLine) && baseLine.length) {
    maxX = Math.max(...baseLine.map(entry => entry.x || 0), maxX);
  }
  if ((0, _DataUtils.isNumber)(maxX)) {
    return /*#__PURE__*/React.createElement("rect", {
      x: 0,
      y: startY < endY ? startY : startY - height,
      width: maxX + (strokeWidth ? parseInt("".concat(strokeWidth), 10) : 1),
      height: Math.floor(height)
    });
  }
  return null;
}
function HorizontalRect(_ref5) {
  const {
    alpha,
    baseLine,
    points,
    strokeWidth
  } = _ref5;
  const startX = points[0].x;
  const endX = points[points.length - 1].x;
  if (!(0, _isWellBehavedNumber.isWellBehavedNumber)(startX) || !(0, _isWellBehavedNumber.isWellBehavedNumber)(endX)) {
    return null;
  }
  const width = alpha * Math.abs(startX - endX);
  let maxY = Math.max(...points.map(entry => entry.y || 0));
  if ((0, _DataUtils.isNumber)(baseLine)) {
    maxY = Math.max(baseLine, maxY);
  } else if (baseLine && Array.isArray(baseLine) && baseLine.length) {
    maxY = Math.max(...baseLine.map(entry => entry.y || 0), maxY);
  }
  if ((0, _DataUtils.isNumber)(maxY)) {
    return /*#__PURE__*/React.createElement("rect", {
      x: startX < endX ? startX : startX - width,
      y: 0,
      width: width,
      height: Math.floor(maxY + (strokeWidth ? parseInt("".concat(strokeWidth), 10) : 1))
    });
  }
  return null;
}
function ClipRect(_ref6) {
  const {
    alpha,
    layout,
    points,
    baseLine,
    strokeWidth
  } = _ref6;
  if (layout === 'vertical') {
    return /*#__PURE__*/React.createElement(VerticalRect, {
      alpha: alpha,
      points: points,
      baseLine: baseLine,
      strokeWidth: strokeWidth
    });
  }
  return /*#__PURE__*/React.createElement(HorizontalRect, {
    alpha: alpha,
    points: points,
    baseLine: baseLine,
    strokeWidth: strokeWidth
  });
}
function AreaWithAnimation(_ref7) {
  const {
    needClip,
    clipPathId,
    props,
    previousPointsRef,
    previousBaselineRef
  } = _ref7;
  const {
    points,
    baseLine,
    isAnimationActive,
    animationBegin,
    animationDuration,
    animationEasing,
    onAnimationStart,
    onAnimationEnd
  } = props;
  const animationId = (0, _useAnimationId.useAnimationId)(props, 'recharts-area-');
  const [isAnimating, setIsAnimating] = (0, _react.useState)(false);
  const showLabels = !isAnimating;
  const handleAnimationEnd = (0, _react.useCallback)(() => {
    if (typeof onAnimationEnd === 'function') {
      onAnimationEnd();
    }
    setIsAnimating(false);
  }, [onAnimationEnd]);
  const handleAnimationStart = (0, _react.useCallback)(() => {
    if (typeof onAnimationStart === 'function') {
      onAnimationStart();
    }
    setIsAnimating(true);
  }, [onAnimationStart]);
  const prevPoints = previousPointsRef.current;
  const prevBaseLine = previousBaselineRef.current;
  return /*#__PURE__*/React.createElement(AreaLabelListProvider, {
    showLabels: showLabels,
    points: points
  }, props.children, /*#__PURE__*/React.createElement(_JavascriptAnimate.JavascriptAnimate, {
    animationId: animationId,
    begin: animationBegin,
    duration: animationDuration,
    isActive: isAnimationActive,
    easing: animationEasing,
    onAnimationEnd: handleAnimationEnd,
    onAnimationStart: handleAnimationStart,
    key: animationId
  }, t => {
    if (prevPoints) {
      const prevPointsDiffFactor = prevPoints.length / points.length;
      const stepPoints =
      /*
       * Here it is important that at the very end of the animation, on the last frame,
       * we render the original points without any interpolation.
       * This is needed because the code above is checking for reference equality to decide if the animation should run
       * and if we create a new array instance (even if the numbers were the same)
       * then we would break animations.
       */
      t === 1 ? points : points.map((entry, index) => {
        const prevPointIndex = Math.floor(index * prevPointsDiffFactor);
        if (prevPoints[prevPointIndex]) {
          const prev = prevPoints[prevPointIndex];
          return _objectSpread(_objectSpread({}, entry), {}, {
            x: (0, _DataUtils.interpolate)(prev.x, entry.x, t),
            y: (0, _DataUtils.interpolate)(prev.y, entry.y, t)
          });
        }
        return entry;
      });
      let stepBaseLine;
      if ((0, _DataUtils.isNumber)(baseLine)) {
        stepBaseLine = (0, _DataUtils.interpolate)(prevBaseLine, baseLine, t);
      } else if ((0, _DataUtils.isNullish)(baseLine) || (0, _DataUtils.isNan)(baseLine)) {
        stepBaseLine = (0, _DataUtils.interpolate)(prevBaseLine, 0, t);
      } else {
        stepBaseLine = baseLine.map((entry, index) => {
          const prevPointIndex = Math.floor(index * prevPointsDiffFactor);
          if (Array.isArray(prevBaseLine) && prevBaseLine[prevPointIndex]) {
            const prev = prevBaseLine[prevPointIndex];
            return _objectSpread(_objectSpread({}, entry), {}, {
              x: (0, _DataUtils.interpolate)(prev.x, entry.x, t),
              y: (0, _DataUtils.interpolate)(prev.y, entry.y, t)
            });
          }
          return entry;
        });
      }
      if (t > 0) {
        /*
         * We need to keep the refs in the parent component because we need to remember the last shape of the animation
         * even if AreaWithAnimation is unmounted as that happens when changing props.
         *
         * And we need to update the refs here because here is where the interpolation is computed.
         * Eslint doesn't like changing function arguments, but we need it so here is an eslint-disable.
         */
        // eslint-disable-next-line no-param-reassign
        previousPointsRef.current = stepPoints;
        // eslint-disable-next-line no-param-reassign
        previousBaselineRef.current = stepBaseLine;
      }
      return /*#__PURE__*/React.createElement(StaticArea, {
        points: stepPoints,
        baseLine: stepBaseLine,
        needClip: needClip,
        clipPathId: clipPathId,
        props: props
      });
    }
    if (t > 0) {
      // eslint-disable-next-line no-param-reassign
      previousPointsRef.current = points;
      // eslint-disable-next-line no-param-reassign
      previousBaselineRef.current = baseLine;
    }
    return /*#__PURE__*/React.createElement(_Layer.Layer, null, isAnimationActive && /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
      id: "animationClipPath-".concat(clipPathId)
    }, /*#__PURE__*/React.createElement(ClipRect, {
      alpha: t,
      points: points,
      baseLine: baseLine,
      layout: props.layout,
      strokeWidth: props.strokeWidth
    }))), /*#__PURE__*/React.createElement(_Layer.Layer, {
      clipPath: "url(#animationClipPath-".concat(clipPathId, ")")
    }, /*#__PURE__*/React.createElement(StaticArea, {
      points: points,
      baseLine: baseLine,
      needClip: needClip,
      clipPathId: clipPathId,
      props: props
    })));
  }), /*#__PURE__*/React.createElement(_LabelList.LabelListFromLabelProp, {
    label: props.label
  }));
}

/*
 * This components decides if the area should be animated or not.
 * It also holds the state of the animation.
 */
function RenderArea(_ref8) {
  const {
    needClip,
    clipPathId,
    props
  } = _ref8;
  /*
   * These two must be refs, not state!
   * Because we want to store the most recent shape of the animation in case we have to interrupt the animation;
   * that happens when user initiates another animation before the current one finishes.
   *
   * If this was a useState, then every step in the animation would trigger a re-render.
   * So, useRef it is.
   */
  const previousPointsRef = (0, _react.useRef)(null);
  const previousBaselineRef = (0, _react.useRef)();
  return /*#__PURE__*/React.createElement(AreaWithAnimation, {
    needClip: needClip,
    clipPathId: clipPathId,
    props: props,
    previousPointsRef: previousPointsRef,
    previousBaselineRef: previousBaselineRef
  });
}
class AreaWithState extends _react.PureComponent {
  render() {
    let _filterProps;
    const {
      hide,
      dot,
      points,
      className,
      top,
      left,
      needClip,
      xAxisId,
      yAxisId,
      width,
      height,
      id,
      baseLine
    } = this.props;
    if (hide) {
      return null;
    }
    const layerClass = (0, _clsx.clsx)('recharts-area', className);
    const clipPathId = id;
    const {
      r = 3,
      strokeWidth = 2
    } = (_filterProps = (0, _ReactUtils.filterProps)(dot, false)) !== null && _filterProps !== void 0 ? _filterProps : {
      r: 3,
      strokeWidth: 2
    };
    const clipDot = (0, _ReactUtils.isClipDot)(dot);
    const dotSize = r * 2 + strokeWidth;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_Layer.Layer, {
      className: layerClass
    }, needClip && /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement(_GraphicalItemClipPath.GraphicalItemClipPath, {
      clipPathId: clipPathId,
      xAxisId: xAxisId,
      yAxisId: yAxisId
    }), !clipDot && /*#__PURE__*/React.createElement("clipPath", {
      id: "clipPath-dots-".concat(clipPathId)
    }, /*#__PURE__*/React.createElement("rect", {
      x: left - dotSize / 2,
      y: top - dotSize / 2,
      width: width + dotSize,
      height: height + dotSize
    }))), /*#__PURE__*/React.createElement(RenderArea, {
      needClip: needClip,
      clipPathId: clipPathId,
      props: this.props
    })), /*#__PURE__*/React.createElement(_ActivePoints.ActivePoints, {
      points: points,
      mainColor: getLegendItemColor(this.props.stroke, this.props.fill),
      itemDataKey: this.props.dataKey,
      activeDot: this.props.activeDot
    }), this.props.isRange && Array.isArray(baseLine) && /*#__PURE__*/React.createElement(_ActivePoints.ActivePoints, {
      points: baseLine,
      mainColor: getLegendItemColor(this.props.stroke, this.props.fill),
      itemDataKey: this.props.dataKey,
      activeDot: this.props.activeDot
    }));
  }
}
const defaultAreaProps = {
  activeDot: true,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease',
  connectNulls: false,
  dot: false,
  fill: '#3182bd',
  fillOpacity: 0.6,
  hide: false,
  isAnimationActive: !_Global.Global.isSsr,
  legendType: 'line',
  stroke: '#3182bd',
  xAxisId: 0,
  yAxisId: 0
};
function AreaImpl(props) {
  let _useAppSelector;
  const _resolveDefaultProps = (0, _resolveDefaultProps2.resolveDefaultProps)(props, defaultAreaProps),
    {
      activeDot,
      animationBegin,
      animationDuration,
      animationEasing,
      connectNulls,
      dot,
      fill,
      fillOpacity,
      hide,
      isAnimationActive,
      legendType,
      stroke,
      xAxisId,
      yAxisId
    } = _resolveDefaultProps,
    everythingElse = _objectWithoutProperties(_resolveDefaultProps, _excluded2);
  const layout = (0, _chartLayoutContext.useChartLayout)();
  const chartName = (0, _selectors.useChartName)();
  const {
    needClip
  } = (0, _GraphicalItemClipPath.useNeedsClip)(xAxisId, yAxisId);
  const isPanorama = (0, _PanoramaContext.useIsPanorama)();
  const {
    points,
    isRange,
    baseLine
  } = (_useAppSelector = (0, _hooks.useAppSelector)(state => (0, _areaSelectors.selectArea)(state, xAxisId, yAxisId, isPanorama, props.id))) !== null && _useAppSelector !== void 0 ? _useAppSelector : {};
  const plotArea = (0, _hooks2.usePlotArea)();
  if (layout !== 'horizontal' && layout !== 'vertical' || plotArea == null) {
    // Can't render Area in an unsupported layout
    return null;
  }
  if (chartName !== 'AreaChart' && chartName !== 'ComposedChart') {
    // There is nothing stopping us from rendering Area in other charts, except for historical reasons. Do we want to allow that?
    return null;
  }
  const {
    height,
    width,
    x: left,
    y: top
  } = plotArea;
  if (!points || !points.length) {
    return null;
  }
  return /*#__PURE__*/React.createElement(AreaWithState, _extends({}, everythingElse, {
    activeDot: activeDot,
    animationBegin: animationBegin,
    animationDuration: animationDuration,
    animationEasing: animationEasing,
    baseLine: baseLine,
    connectNulls: connectNulls,
    dot: dot,
    fill: fill,
    fillOpacity: fillOpacity,
    height: height,
    hide: hide,
    layout: layout,
    isAnimationActive: isAnimationActive,
    isRange: isRange,
    legendType: legendType,
    needClip: needClip,
    points: points,
    stroke: stroke,
    width: width,
    left: left,
    top: top,
    xAxisId: xAxisId,
    yAxisId: yAxisId
  }));
}
const getBaseValue = (layout, chartBaseValue, itemBaseValue, xAxis, yAxis) => {
  // The baseValue can be defined both on the AreaChart, and on the Area.
  // The value for the item takes precedence.
  const baseValue = itemBaseValue !== null && itemBaseValue !== void 0 ? itemBaseValue : chartBaseValue;
  if ((0, _DataUtils.isNumber)(baseValue)) {
    return baseValue;
  }
  const numericAxis = layout === 'horizontal' ? yAxis : xAxis;
  // @ts-expect-error d3scale .domain() returns unknown, Math.max expects number
  const domain = numericAxis.scale.domain();
  if (numericAxis.type === 'number') {
    const domainMax = Math.max(domain[0], domain[1]);
    const domainMin = Math.min(domain[0], domain[1]);
    if (baseValue === 'dataMin') {
      return domainMin;
    }
    if (baseValue === 'dataMax') {
      return domainMax;
    }
    return domainMax < 0 ? domainMax : Math.max(Math.min(domain[0], domain[1]), 0);
  }
  if (baseValue === 'dataMin') {
    return domain[0];
  }
  if (baseValue === 'dataMax') {
    return domain[1];
  }
  return domain[0];
};
exports.getBaseValue = getBaseValue;
function computeArea(_ref9) {
  const {
    areaSettings: {
      connectNulls,
      baseValue: itemBaseValue,
      dataKey
    },
    stackedData,
    layout,
    chartBaseValue,
    xAxis,
    yAxis,
    displayedData,
    dataStartIndex,
    xAxisTicks,
    yAxisTicks,
    bandSize
  } = _ref9;
  const hasStack = stackedData && stackedData.length;
  const baseValue = getBaseValue(layout, chartBaseValue, itemBaseValue, xAxis, yAxis);
  const isHorizontalLayout = layout === 'horizontal';
  let isRange = false;
  const points = displayedData.map((entry, index) => {
    let value;
    if (hasStack) {
      value = stackedData[dataStartIndex + index];
    } else {
      value = (0, _ChartUtils.getValueByDataKey)(entry, dataKey);
      if (!Array.isArray(value)) {
        value = [baseValue, value];
      } else {
        isRange = true;
      }
    }
    const isBreakPoint = value[1] == null || hasStack && !connectNulls && (0, _ChartUtils.getValueByDataKey)(entry, dataKey) == null;
    if (isHorizontalLayout) {
      return {
        x: (0, _ChartUtils.getCateCoordinateOfLine)({
          axis: xAxis,
          ticks: xAxisTicks,
          bandSize,
          entry,
          index
        }),
        y: isBreakPoint ? null : yAxis.scale(value[1]),
        value,
        payload: entry
      };
    }
    return {
      x: isBreakPoint ? null : xAxis.scale(value[1]),
      y: (0, _ChartUtils.getCateCoordinateOfLine)({
        axis: yAxis,
        ticks: yAxisTicks,
        bandSize,
        entry,
        index
      }),
      value,
      payload: entry
    };
  });
  let baseLine;
  if (hasStack || isRange) {
    baseLine = points.map(entry => {
      const x = Array.isArray(entry.value) ? entry.value[0] : null;
      if (isHorizontalLayout) {
        return {
          x: entry.x,
          y: x != null && entry.y != null ? yAxis.scale(x) : null,
          payload: entry.payload
        };
      }
      return {
        x: x != null ? xAxis.scale(x) : null,
        y: entry.y,
        payload: entry.payload
      };
    });
  } else {
    baseLine = isHorizontalLayout ? yAxis.scale(baseValue) : xAxis.scale(baseValue);
  }
  return {
    points,
    baseLine,
    isRange
  };
}
function AreaFn(outsideProps) {
  const props = (0, _resolveDefaultProps2.resolveDefaultProps)(outsideProps, defaultAreaProps);
  const isPanorama = (0, _PanoramaContext.useIsPanorama)();
  // Report all props to Redux store first, before calling any hooks, to avoid circular dependencies.
  return /*#__PURE__*/React.createElement(_RegisterGraphicalItemId.RegisterGraphicalItemId, {
    id: props.id,
    type: "area"
  }, id => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_SetLegendPayload.SetLegendPayload, {
    legendPayload: computeLegendPayloadFromAreaData(props)
  }), /*#__PURE__*/React.createElement(_SetTooltipEntrySettings.SetTooltipEntrySettings, {
    fn: getTooltipEntrySettings,
    args: props
  }), /*#__PURE__*/React.createElement(_SetGraphicalItem.SetCartesianGraphicalItem, {
    type: "area",
    id: id,
    data: props.data,
    dataKey: props.dataKey,
    xAxisId: props.xAxisId,
    yAxisId: props.yAxisId,
    zAxisId: 0,
    stackId: (0, _ChartUtils.getNormalizedStackId)(props.stackId),
    hide: props.hide,
    barSize: undefined,
    baseValue: props.baseValue,
    isPanorama: isPanorama,
    connectNulls: props.connectNulls
  }), /*#__PURE__*/React.createElement(AreaImpl, _extends({}, props, {
    id: id
  }))));
}
const Area = exports.Area = /*#__PURE__*/React.memo(AreaFn);
Area.displayName = 'Area';
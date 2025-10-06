"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bar = void 0;
exports.computeBarRectangles = computeBarRectangles;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _clsx = require("clsx");
const _Layer = require("../container/Layer");
const _Cell = require("../component/Cell");
const _LabelList = require("../component/LabelList");
const _DataUtils = require("../util/DataUtils");
const _ReactUtils = require("../util/ReactUtils");
const _Global = require("../util/Global");
const _ChartUtils = require("../util/ChartUtils");
const _types = require("../util/types");
const _BarUtils = require("../util/BarUtils");
const _tooltipContext = require("../context/tooltipContext");
const _SetTooltipEntrySettings = require("../state/SetTooltipEntrySettings");
const _ErrorBarContext = require("../context/ErrorBarContext");
const _GraphicalItemClipPath = require("./GraphicalItemClipPath");
const _chartLayoutContext = require("../context/chartLayoutContext");
const _barSelectors = require("../state/selectors/barSelectors");
const _hooks = require("../state/hooks");
const _PanoramaContext = require("../context/PanoramaContext");
const _tooltipSelectors = require("../state/selectors/tooltipSelectors");
const _SetLegendPayload = require("../state/SetLegendPayload");
const _useAnimationId = require("../util/useAnimationId");
const _resolveDefaultProps = require("../util/resolveDefaultProps");
const _RegisterGraphicalItemId = require("../context/RegisterGraphicalItemId");
const _SetGraphicalItem = require("../state/SetGraphicalItem");
const _svgPropertiesNoEvents = require("../util/svgPropertiesNoEvents");
const _JavascriptAnimate = require("../animation/JavascriptAnimate");
const _excluded = ["onMouseEnter", "onMouseLeave", "onClick"],
  _excluded2 = ["value", "background", "tooltipPosition"],
  _excluded3 = ["id"],
  _excluded4 = ["onMouseEnter", "onClick", "onMouseLeave"];
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
const computeLegendPayloadFromBarData = props => {
  const {
    dataKey,
    name,
    fill,
    legendType,
    hide
  } = props;
  return [{
    inactive: hide,
    dataKey,
    type: legendType,
    color: fill,
    value: (0, _ChartUtils.getTooltipNameProp)(name, dataKey),
    payload: props
  }];
};
function getTooltipEntrySettings(props) {
  const {
    dataKey,
    stroke,
    strokeWidth,
    fill,
    name,
    hide,
    unit
  } = props;
  return {
    dataDefinedOnItem: undefined,
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
      color: props.fill,
      unit
    }
  };
}
function BarBackground(props) {
  const activeIndex = (0, _hooks.useAppSelector)(_tooltipSelectors.selectActiveTooltipIndex);
  const {
    data,
    dataKey,
    background: backgroundFromProps,
    allOtherBarProps
  } = props;
  let {
      onMouseEnter: onMouseEnterFromProps,
      onMouseLeave: onMouseLeaveFromProps,
      onClick: onItemClickFromProps
    } = allOtherBarProps,
    restOfAllOtherProps = _objectWithoutProperties(allOtherBarProps, _excluded);

  // @ts-expect-error bar mouse events are not compatible with recharts mouse events
  const onMouseEnterFromContext = (0, _tooltipContext.useMouseEnterItemDispatch)(onMouseEnterFromProps, dataKey);
  // @ts-expect-error bar mouse events are not compatible with recharts mouse events
  const onMouseLeaveFromContext = (0, _tooltipContext.useMouseLeaveItemDispatch)(onMouseLeaveFromProps);
  // @ts-expect-error bar mouse events are not compatible with recharts mouse events
  const onClickFromContext = (0, _tooltipContext.useMouseClickItemDispatch)(onItemClickFromProps, dataKey);
  if (!backgroundFromProps || data == null) {
    return null;
  }
  const backgroundProps = (0, _ReactUtils.filterProps)(backgroundFromProps, false);
  return /*#__PURE__*/React.createElement(React.Fragment, null, data.map((entry, i) => {
    let {
        value,
        background: backgroundFromDataEntry,
        tooltipPosition
      } = entry,
      rest = _objectWithoutProperties(entry, _excluded2);
    if (!backgroundFromDataEntry) {
      return null;
    }

    // @ts-expect-error BarRectangleItem type definition says it's missing properties, but I can see them present in debugger!
    const onMouseEnter = onMouseEnterFromContext(entry, i);
    // @ts-expect-error BarRectangleItem type definition says it's missing properties, but I can see them present in debugger!
    const onMouseLeave = onMouseLeaveFromContext(entry, i);
    // @ts-expect-error BarRectangleItem type definition says it's missing properties, but I can see them present in debugger!
    const onClick = onClickFromContext(entry, i);
    const barRectangleProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({
      option: backgroundFromProps,
      isActive: String(i) === activeIndex
    }, rest), {}, {
      // @ts-expect-error BarRectangle props do not accept `fill` property.
      fill: '#eee'
    }, backgroundFromDataEntry), backgroundProps), (0, _types.adaptEventsOfChild)(restOfAllOtherProps, entry, i)), {}, {
      onMouseEnter,
      onMouseLeave,
      onClick,
      dataKey,
      index: i,
      className: 'recharts-bar-background-rectangle'
    });
    return /*#__PURE__*/React.createElement(_BarUtils.BarRectangle, _extends({
      key: "background-bar-".concat(barRectangleProps.index)
    }, barRectangleProps));
  }));
}
function BarLabelListProvider(_ref) {
  const {
    showLabels,
    children,
    rects
  } = _ref;
  const labelListEntries = rects === null || rects === void 0 ? void 0 : rects.map(entry => {
    const viewBox = {
      x: entry.x,
      y: entry.y,
      width: entry.width,
      height: entry.height
    };
    return _objectSpread(_objectSpread({}, viewBox), {}, {
      value: entry.value,
      payload: entry.payload,
      parentViewBox: entry.parentViewBox,
      viewBox,
      fill: entry.fill
    });
  });
  return /*#__PURE__*/React.createElement(_LabelList.CartesianLabelListContextProvider, {
    value: showLabels ? labelListEntries : undefined
  }, children);
}
function BarRectangleWithActiveState(props) {
  const {
    shape,
    activeBar,
    baseProps,
    entry,
    index,
    dataKey
  } = props;
  const activeIndex = (0, _hooks.useAppSelector)(_tooltipSelectors.selectActiveTooltipIndex);
  const activeDataKey = (0, _hooks.useAppSelector)(_tooltipSelectors.selectActiveTooltipDataKey);
  /*
   * Bars support stacking, meaning that there can be multiple bars at the same x value.
   * With Tooltip shared=false we only want to highlight the currently active Bar, not all.
   *
   * Also, if the tooltip is shared, we want to highlight all bars at the same x value
   * regardless of the dataKey.
   *
   * With shared Tooltip, the activeDataKey is undefined.
   */
  const isActive = activeBar && String(index) === activeIndex && (activeDataKey == null || dataKey === activeDataKey);
  const option = isActive ? activeBar : shape;
  return /*#__PURE__*/React.createElement(_BarUtils.BarRectangle, _extends({}, baseProps, entry, {
    isActive: isActive,
    option: option,
    index: index,
    dataKey: dataKey
  }));
}
function BarRectangleNeverActive(props) {
  const {
    shape,
    baseProps,
    entry,
    index,
    dataKey
  } = props;
  return /*#__PURE__*/React.createElement(_BarUtils.BarRectangle, _extends({}, baseProps, entry, {
    isActive: false,
    option: shape,
    index: index,
    dataKey: dataKey
  }));
}
function BarRectangles(_ref2) {
  const {
    data,
    props
  } = _ref2;
  const _svgPropertiesNoEvent = (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(props),
    {
      id
    } = _svgPropertiesNoEvent,
    baseProps = _objectWithoutProperties(_svgPropertiesNoEvent, _excluded3);
  const {
    shape,
    dataKey,
    activeBar
  } = props;
  let {
      onMouseEnter: onMouseEnterFromProps,
      onClick: onItemClickFromProps,
      onMouseLeave: onMouseLeaveFromProps
    } = props,
    restOfAllOtherProps = _objectWithoutProperties(props, _excluded4);

  // @ts-expect-error bar mouse events are not compatible with recharts mouse events
  const onMouseEnterFromContext = (0, _tooltipContext.useMouseEnterItemDispatch)(onMouseEnterFromProps, dataKey);
  // @ts-expect-error bar mouse events are not compatible with recharts mouse events
  const onMouseLeaveFromContext = (0, _tooltipContext.useMouseLeaveItemDispatch)(onMouseLeaveFromProps);
  // @ts-expect-error bar mouse events are not compatible with recharts mouse events
  const onClickFromContext = (0, _tooltipContext.useMouseClickItemDispatch)(onItemClickFromProps, dataKey);
  if (!data) {
    return null;
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, data.map((entry, i) => {
    return /*#__PURE__*/React.createElement(_Layer.Layer, _extends({
      className: "recharts-bar-rectangle"
    }, (0, _types.adaptEventsOfChild)(restOfAllOtherProps, entry, i), {
      // @ts-expect-error BarRectangleItem type definition says it's missing properties, but I can see them present in debugger!
      onMouseEnter: onMouseEnterFromContext(entry, i)
      // @ts-expect-error BarRectangleItem type definition says it's missing properties, but I can see them present in debugger!
      ,
      onMouseLeave: onMouseLeaveFromContext(entry, i)
      // @ts-expect-error BarRectangleItem type definition says it's missing properties, but I can see them present in debugger!
      ,
      onClick: onClickFromContext(entry, i)
      // https://github.com/recharts/recharts/issues/5415
      // eslint-disable-next-line react/no-array-index-key
      ,
      key: "rectangle-".concat(entry === null || entry === void 0 ? void 0 : entry.x, "-").concat(entry === null || entry === void 0 ? void 0 : entry.y, "-").concat(entry === null || entry === void 0 ? void 0 : entry.value, "-").concat(i)
    }), activeBar ? /*#__PURE__*/React.createElement(BarRectangleWithActiveState, {
      shape: shape,
      activeBar: activeBar,
      baseProps: baseProps,
      entry: entry,
      index: i,
      dataKey: dataKey
    }) :
    /*#__PURE__*/
    /*
     * If the `activeBar` prop is falsy, then let's call the variant without hooks.
     * Using the `selectActiveTooltipIndex` selector is usually fast
     * but in charts with large-ish amount of data even the few nanoseconds add up to a noticeable jank.
     * If the activeBar is false then we don't need to know which index is active - because we won't use it anyway.
     * So let's just skip the hooks altogether. That way, React can skip rendering the component,
     * and can skip the tree reconciliation for its children too.
     * Because we can't call hooks conditionally, we need to have a separate component for that.
     */
    React.createElement(BarRectangleNeverActive, {
      shape: shape,
      baseProps: baseProps,
      entry: entry,
      index: i,
      dataKey: dataKey
    }));
  }));
}
function RectanglesWithAnimation(_ref3) {
  const {
    props,
    previousRectanglesRef
  } = _ref3;
  const {
    data,
    layout,
    isAnimationActive,
    animationBegin,
    animationDuration,
    animationEasing,
    onAnimationEnd,
    onAnimationStart
  } = props;
  const prevData = previousRectanglesRef.current;
  const animationId = (0, _useAnimationId.useAnimationId)(props, 'recharts-bar-');
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
  return /*#__PURE__*/React.createElement(BarLabelListProvider, {
    showLabels: showLabels,
    rects: data
  }, /*#__PURE__*/React.createElement(_JavascriptAnimate.JavascriptAnimate, {
    animationId: animationId,
    begin: animationBegin,
    duration: animationDuration,
    isActive: isAnimationActive,
    easing: animationEasing,
    onAnimationEnd: handleAnimationEnd,
    onAnimationStart: handleAnimationStart,
    key: animationId
  }, t => {
    const stepData = t === 1 ? data : data === null || data === void 0 ? void 0 : data.map((entry, index) => {
      const prev = prevData && prevData[index];
      if (prev) {
        return _objectSpread(_objectSpread({}, entry), {}, {
          x: (0, _DataUtils.interpolate)(prev.x, entry.x, t),
          y: (0, _DataUtils.interpolate)(prev.y, entry.y, t),
          width: (0, _DataUtils.interpolate)(prev.width, entry.width, t),
          height: (0, _DataUtils.interpolate)(prev.height, entry.height, t)
        });
      }
      if (layout === 'horizontal') {
        const h = (0, _DataUtils.interpolate)(0, entry.height, t);
        return _objectSpread(_objectSpread({}, entry), {}, {
          y: entry.y + entry.height - h,
          height: h
        });
      }
      const w = (0, _DataUtils.interpolate)(0, entry.width, t);
      return _objectSpread(_objectSpread({}, entry), {}, {
        width: w
      });
    });
    if (t > 0) {
      // eslint-disable-next-line no-param-reassign
      previousRectanglesRef.current = stepData !== null && stepData !== void 0 ? stepData : null;
    }
    if (stepData == null) {
      return null;
    }
    return /*#__PURE__*/React.createElement(_Layer.Layer, null, /*#__PURE__*/React.createElement(BarRectangles, {
      props: props,
      data: stepData
    }));
  }), /*#__PURE__*/React.createElement(_LabelList.LabelListFromLabelProp, {
    label: props.label
  }), props.children);
}
function RenderRectangles(props) {
  const previousRectanglesRef = (0, _react.useRef)(null);
  return /*#__PURE__*/React.createElement(RectanglesWithAnimation, {
    previousRectanglesRef: previousRectanglesRef,
    props: props
  });
}
const defaultMinPointSize = 0;
const errorBarDataPointFormatter = (dataPoint, dataKey) => {
  /**
   * if the value coming from `selectBarRectangles` is an array then this is a stacked bar chart.
   * arr[1] represents end value of the bar since the data is in the form of [startValue, endValue].
   * */
  const value = Array.isArray(dataPoint.value) ? dataPoint.value[1] : dataPoint.value;
  return {
    x: dataPoint.x,
    y: dataPoint.y,
    value,
    // @ts-expect-error getValueByDataKey does not validate the output type
    errorVal: (0, _ChartUtils.getValueByDataKey)(dataPoint, dataKey)
  };
};
class BarWithState extends _react.PureComponent {
  render() {
    const {
      hide,
      data,
      dataKey,
      className,
      xAxisId,
      yAxisId,
      needClip,
      background,
      id
    } = this.props;
    if (hide || data == null) {
      return null;
    }
    const layerClass = (0, _clsx.clsx)('recharts-bar', className);
    const clipPathId = id;
    return /*#__PURE__*/React.createElement(_Layer.Layer, {
      className: layerClass,
      id: id
    }, needClip && /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement(_GraphicalItemClipPath.GraphicalItemClipPath, {
      clipPathId: clipPathId,
      xAxisId: xAxisId,
      yAxisId: yAxisId
    })), /*#__PURE__*/React.createElement(_Layer.Layer, {
      className: "recharts-bar-rectangles",
      clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : undefined
    }, /*#__PURE__*/React.createElement(BarBackground, {
      data: data,
      dataKey: dataKey,
      background: background,
      allOtherBarProps: this.props
    }), /*#__PURE__*/React.createElement(RenderRectangles, this.props)));
  }
}
const defaultBarProps = {
  activeBar: false,
  animationBegin: 0,
  animationDuration: 400,
  animationEasing: 'ease',
  hide: false,
  isAnimationActive: !_Global.Global.isSsr,
  legendType: 'rect',
  minPointSize: defaultMinPointSize,
  xAxisId: 0,
  yAxisId: 0
};
function BarImpl(props) {
  const {
    xAxisId,
    yAxisId,
    hide,
    legendType,
    minPointSize,
    activeBar,
    animationBegin,
    animationDuration,
    animationEasing,
    isAnimationActive
  } = props;
  const {
    needClip
  } = (0, _GraphicalItemClipPath.useNeedsClip)(xAxisId, yAxisId);
  const layout = (0, _chartLayoutContext.useChartLayout)();
  const isPanorama = (0, _PanoramaContext.useIsPanorama)();
  const cells = (0, _ReactUtils.findAllByType)(props.children, _Cell.Cell);
  const rects = (0, _hooks.useAppSelector)(state => (0, _barSelectors.selectBarRectangles)(state, xAxisId, yAxisId, isPanorama, props.id, cells));
  if (layout !== 'vertical' && layout !== 'horizontal') {
    return null;
  }
  let errorBarOffset;
  const firstDataPoint = rects === null || rects === void 0 ? void 0 : rects[0];
  if (firstDataPoint == null || firstDataPoint.height == null || firstDataPoint.width == null) {
    errorBarOffset = 0;
  } else {
    errorBarOffset = layout === 'vertical' ? firstDataPoint.height / 2 : firstDataPoint.width / 2;
  }
  return /*#__PURE__*/React.createElement(_ErrorBarContext.SetErrorBarContext, {
    xAxisId: xAxisId,
    yAxisId: yAxisId,
    data: rects,
    dataPointFormatter: errorBarDataPointFormatter,
    errorBarOffset: errorBarOffset
  }, /*#__PURE__*/React.createElement(BarWithState, _extends({}, props, {
    layout: layout,
    needClip: needClip,
    data: rects,
    xAxisId: xAxisId,
    yAxisId: yAxisId,
    hide: hide,
    legendType: legendType,
    minPointSize: minPointSize,
    activeBar: activeBar,
    animationBegin: animationBegin,
    animationDuration: animationDuration,
    animationEasing: animationEasing,
    isAnimationActive: isAnimationActive
  })));
}
function computeBarRectangles(_ref4) {
  const {
    layout,
    barSettings: {
      dataKey,
      minPointSize: minPointSizeProp
    },
    pos,
    bandSize,
    xAxis,
    yAxis,
    xAxisTicks,
    yAxisTicks,
    stackedData,
    displayedData,
    offset,
    cells,
    parentViewBox
  } = _ref4;
  const numericAxis = layout === 'horizontal' ? yAxis : xAxis;
  // @ts-expect-error this assumes that the domain is always numeric, but doesn't check for it
  const stackedDomain = stackedData ? numericAxis.scale.domain() : null;
  const baseValue = (0, _ChartUtils.getBaseValueOfBar)({
    numericAxis
  });
  return displayedData.map((entry, index) => {
    let value, x, y, width, height, background;
    if (stackedData) {
      // we don't need to use dataStartIndex here, because stackedData is already sliced from the selector
      value = (0, _ChartUtils.truncateByDomain)(stackedData[index], stackedDomain);
    } else {
      value = (0, _ChartUtils.getValueByDataKey)(entry, dataKey);
      if (!Array.isArray(value)) {
        value = [baseValue, value];
      }
    }
    const minPointSize = (0, _BarUtils.minPointSizeCallback)(minPointSizeProp, defaultMinPointSize)(value[1], index);
    if (layout === 'horizontal') {
      let _ref5;
      const [baseValueScale, currentValueScale] = [yAxis.scale(value[0]), yAxis.scale(value[1])];
      x = (0, _ChartUtils.getCateCoordinateOfBar)({
        axis: xAxis,
        ticks: xAxisTicks,
        bandSize,
        offset: pos.offset,
        entry,
        index
      });
      y = (_ref5 = currentValueScale !== null && currentValueScale !== void 0 ? currentValueScale : baseValueScale) !== null && _ref5 !== void 0 ? _ref5 : undefined;
      width = pos.size;
      const computedHeight = baseValueScale - currentValueScale;
      height = (0, _DataUtils.isNan)(computedHeight) ? 0 : computedHeight;
      background = {
        x,
        y: offset.top,
        width,
        height: offset.height
      };
      if (Math.abs(minPointSize) > 0 && Math.abs(height) < Math.abs(minPointSize)) {
        const delta = (0, _DataUtils.mathSign)(height || minPointSize) * (Math.abs(minPointSize) - Math.abs(height));
        y -= delta;
        height += delta;
      }
    } else {
      const [_baseValueScale, _currentValueScale] = [xAxis.scale(value[0]), xAxis.scale(value[1])];
      x = _baseValueScale;
      y = (0, _ChartUtils.getCateCoordinateOfBar)({
        axis: yAxis,
        ticks: yAxisTicks,
        bandSize,
        offset: pos.offset,
        entry,
        index
      });
      width = _currentValueScale - _baseValueScale;
      height = pos.size;
      background = {
        x: offset.left,
        y,
        width: offset.width,
        height
      };
      if (Math.abs(minPointSize) > 0 && Math.abs(width) < Math.abs(minPointSize)) {
        const _delta = (0, _DataUtils.mathSign)(width || minPointSize) * (Math.abs(minPointSize) - Math.abs(width));
        width += _delta;
      }
    }
    if (x == null || y == null || width == null || height == null) {
      return null;
    }
    const barRectangleItem = _objectSpread(_objectSpread({}, entry), {}, {
      x,
      y,
      width,
      height,
      value: stackedData ? value : value[1],
      payload: entry,
      background,
      tooltipPosition: {
        x: x + width / 2,
        y: y + height / 2
      },
      parentViewBox
    }, cells && cells[index] && cells[index].props);
    return barRectangleItem;
  }).filter(Boolean);
}
function BarFn(outsideProps) {
  const props = (0, _resolveDefaultProps.resolveDefaultProps)(outsideProps, defaultBarProps);
  const isPanorama = (0, _PanoramaContext.useIsPanorama)();
  // Report all props to Redux store first, before calling any hooks, to avoid circular dependencies.
  return /*#__PURE__*/React.createElement(_RegisterGraphicalItemId.RegisterGraphicalItemId, {
    id: props.id,
    type: "bar"
  }, id => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_SetLegendPayload.SetLegendPayload, {
    legendPayload: computeLegendPayloadFromBarData(props)
  }), /*#__PURE__*/React.createElement(_SetTooltipEntrySettings.SetTooltipEntrySettings, {
    fn: getTooltipEntrySettings,
    args: props
  }), /*#__PURE__*/React.createElement(_SetGraphicalItem.SetCartesianGraphicalItem, {
    type: "bar",
    id: id
    // Bar does not allow setting data directly on the graphical item (why?)
    ,
    data: undefined,
    xAxisId: props.xAxisId,
    yAxisId: props.yAxisId,
    zAxisId: 0,
    dataKey: props.dataKey,
    stackId: (0, _ChartUtils.getNormalizedStackId)(props.stackId),
    hide: props.hide,
    barSize: props.barSize,
    minPointSize: props.minPointSize,
    maxBarSize: props.maxBarSize,
    isPanorama: isPanorama
  }), /*#__PURE__*/React.createElement(BarImpl, _extends({}, props, {
    id: id
  }))));
}
const Bar = exports.Bar = /*#__PURE__*/React.memo(BarFn);
Bar.displayName = 'Bar';
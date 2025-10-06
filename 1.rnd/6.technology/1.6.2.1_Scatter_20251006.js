"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Scatter = void 0;
exports.computeScatterPoints = computeScatterPoints;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _clsx = require("clsx");
const _Layer = require("../container/Layer");
const _LabelList = require("../component/LabelList");
const _ReactUtils = require("../util/ReactUtils");
const _Global = require("../util/Global");
const _ZAxis = require("./ZAxis");
const _Curve = require("../shape/Curve");
const _Cell = require("../component/Cell");
const _DataUtils = require("../util/DataUtils");
const _ChartUtils = require("../util/ChartUtils");
const _types = require("../util/types");
const _ScatterUtils = require("../util/ScatterUtils");
const _tooltipContext = require("../context/tooltipContext");
const _SetTooltipEntrySettings = require("../state/SetTooltipEntrySettings");
const _ErrorBarContext = require("../context/ErrorBarContext");
const _GraphicalItemClipPath = require("./GraphicalItemClipPath");
const _scatterSelectors = require("../state/selectors/scatterSelectors");
const _hooks = require("../state/hooks");
const _PanoramaContext = require("../context/PanoramaContext");
const _tooltipSelectors = require("../state/selectors/tooltipSelectors");
const _SetLegendPayload = require("../state/SetLegendPayload");
const _Constants = require("../util/Constants");
const _useAnimationId = require("../util/useAnimationId");
const _resolveDefaultProps2 = require("../util/resolveDefaultProps");
const _RegisterGraphicalItemId = require("../context/RegisterGraphicalItemId");
const _SetGraphicalItem = require("../state/SetGraphicalItem");
const _svgPropertiesNoEvents = require("../util/svgPropertiesNoEvents");
const _JavascriptAnimate = require("../animation/JavascriptAnimate");
const _chartLayoutContext = require("../context/chartLayoutContext");
const _excluded = ["onMouseEnter", "onClick", "onMouseLeave"],
  _excluded2 = ["id"],
  _excluded3 = ["animationBegin", "animationDuration", "animationEasing", "hide", "isAnimationActive", "legendType", "lineJointType", "lineType", "shape", "xAxisId", "yAxisId", "zAxisId"];
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Internal props, combination of external props + defaultProps + private Recharts state
 */

/**
 * External props, intended for end users to fill in
 */

/**
 * Because of naming conflict, we are forced to ignore certain (valid) SVG attributes.
 */

const computeLegendPayloadFromScatterProps = props => {
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
function ScatterLine(_ref) {
  const {
    points,
    props
  } = _ref;
  const {
    line,
    lineType,
    lineJointType
  } = props;
  if (!line) {
    return null;
  }
  const scatterProps = (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(props);
  const customLineProps = (0, _ReactUtils.filterProps)(line, false);
  let linePoints, lineItem;
  if (lineType === 'joint') {
    linePoints = points.map(entry => ({
      x: entry.cx,
      y: entry.cy
    }));
  } else if (lineType === 'fitting') {
    const {
      xmin,
      xmax,
      a,
      b
    } = (0, _DataUtils.getLinearRegression)(points);
    const linearExp = x => a * x + b;
    linePoints = [{
      x: xmin,
      y: linearExp(xmin)
    }, {
      x: xmax,
      y: linearExp(xmax)
    }];
  }
  const lineProps = _objectSpread(_objectSpread(_objectSpread({}, scatterProps), {}, {
    fill: 'none',
    stroke: scatterProps && scatterProps.fill
  }, customLineProps), {}, {
    points: linePoints
  });
  if (/*#__PURE__*/React.isValidElement(line)) {
    lineItem = /*#__PURE__*/React.cloneElement(line, lineProps);
  } else if (typeof line === 'function') {
    lineItem = line(lineProps);
  } else {
    lineItem = /*#__PURE__*/React.createElement(_Curve.Curve, _extends({}, lineProps, {
      type: lineJointType
    }));
  }
  return /*#__PURE__*/React.createElement(_Layer.Layer, {
    className: "recharts-scatter-line",
    key: "recharts-scatter-line"
  }, lineItem);
}
function ScatterLabelListProvider(_ref2) {
  const {
    showLabels,
    points,
    children
  } = _ref2;
  const chartViewBox = (0, _chartLayoutContext.useViewBox)();
  const labelListEntries = (0, _react.useMemo)(() => {
    return points === null || points === void 0 ? void 0 : points.map(point => {
      const viewBox = {
        /*
         * Scatter label uses x and y as the reference point for the label,
         * not cx and cy.
         */
        x: point.x,
        /*
         * Scatter label uses x and y as the reference point for the label,
         * not cx and cy.
         */
        y: point.y,
        width: point.width,
        height: point.height
      };
      return _objectSpread(_objectSpread({}, viewBox), {}, {
        /*
         * Here we put undefined because Scatter shows two values usually, one for X and one for Y.
         * LabelList will see this undefined and will use its own `dataKey` prop to determine which value to show,
         * using the payload below.
         */
        value: undefined,
        payload: point.payload,
        viewBox,
        parentViewBox: chartViewBox,
        fill: undefined
      });
    });
  }, [chartViewBox, points]);
  return /*#__PURE__*/React.createElement(_LabelList.CartesianLabelListContextProvider, {
    value: showLabels ? labelListEntries : null
  }, children);
}
function ScatterSymbols(props) {
  const {
    points,
    allOtherScatterProps
  } = props;
  const {
    shape,
    activeShape,
    dataKey
  } = allOtherScatterProps;
  const activeIndex = (0, _hooks.useAppSelector)(_tooltipSelectors.selectActiveTooltipIndex);
  let {
      onMouseEnter: onMouseEnterFromProps,
      onClick: onItemClickFromProps,
      onMouseLeave: onMouseLeaveFromProps
    } = allOtherScatterProps,
    restOfAllOtherProps = _objectWithoutProperties(allOtherScatterProps, _excluded);
  const onMouseEnterFromContext = (0, _tooltipContext.useMouseEnterItemDispatch)(onMouseEnterFromProps, allOtherScatterProps.dataKey);
  const onMouseLeaveFromContext = (0, _tooltipContext.useMouseLeaveItemDispatch)(onMouseLeaveFromProps);
  const onClickFromContext = (0, _tooltipContext.useMouseClickItemDispatch)(onItemClickFromProps, allOtherScatterProps.dataKey);
  if (points == null) {
    return null;
  }
  let {
      id
    } = allOtherScatterProps,
    allOtherPropsWithoutId = _objectWithoutProperties(allOtherScatterProps, _excluded2);
  const baseProps = (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(allOtherPropsWithoutId);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ScatterLine, {
    points: points,
    props: allOtherPropsWithoutId
  }), points.map((entry, i) => {
    const isActive = activeShape && activeIndex === String(i);
    const option = isActive ? activeShape : shape;
    const symbolProps = _objectSpread(_objectSpread(_objectSpread({
      key: "symbol-".concat(i)
    }, baseProps), entry), {}, {
      [_Constants.DATA_ITEM_INDEX_ATTRIBUTE_NAME]: i,
      [_Constants.DATA_ITEM_DATAKEY_ATTRIBUTE_NAME]: String(dataKey)
    });
    return /*#__PURE__*/React.createElement(_Layer.Layer, _extends({
      className: "recharts-scatter-symbol"
    }, (0, _types.adaptEventsOfChild)(restOfAllOtherProps, entry, i), {
      // @ts-expect-error the types need a bit of attention
      onMouseEnter: onMouseEnterFromContext(entry, i)
      // @ts-expect-error the types need a bit of attention
      ,
      onMouseLeave: onMouseLeaveFromContext(entry, i)
      // @ts-expect-error the types need a bit of attention
      ,
      onClick: onClickFromContext(entry, i)
      // eslint-disable-next-line react/no-array-index-key
      ,
      key: "symbol-".concat(entry === null || entry === void 0 ? void 0 : entry.cx, "-").concat(entry === null || entry === void 0 ? void 0 : entry.cy, "-").concat(entry === null || entry === void 0 ? void 0 : entry.size, "-").concat(i)
    }), /*#__PURE__*/React.createElement(_ScatterUtils.ScatterSymbol, _extends({
      option: option,
      isActive: isActive
    }, symbolProps)));
  }));
}
function SymbolsWithAnimation(_ref3) {
  const {
    previousPointsRef,
    props
  } = _ref3;
  const {
    points,
    isAnimationActive,
    animationBegin,
    animationDuration,
    animationEasing
  } = props;
  const prevPoints = previousPointsRef.current;
  const animationId = (0, _useAnimationId.useAnimationId)(props, 'recharts-scatter-');
  const [isAnimating, setIsAnimating] = (0, _react.useState)(false);
  const handleAnimationEnd = (0, _react.useCallback)(() => {
    // Scatter doesn't have onAnimationEnd prop, and if we want to add it we do it here
    // if (typeof onAnimationEnd === 'function') {
    //   onAnimationEnd();
    // }
    setIsAnimating(false);
  }, []);
  const handleAnimationStart = (0, _react.useCallback)(() => {
    // Scatter doesn't have onAnimationStart prop, and if we want to add it we do it here
    // if (typeof onAnimationStart === 'function') {
    //   onAnimationStart();
    // }
    setIsAnimating(true);
  }, []);
  const showLabels = !isAnimating;
  return /*#__PURE__*/React.createElement(ScatterLabelListProvider, {
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
    const stepData = t === 1 ? points : points === null || points === void 0 ? void 0 : points.map((entry, index) => {
      const prev = prevPoints && prevPoints[index];
      if (prev) {
        const interpolatorCx = (0, _DataUtils.interpolateNumber)(prev.cx, entry.cx);
        const interpolatorCy = (0, _DataUtils.interpolateNumber)(prev.cy, entry.cy);
        const interpolatorSize = (0, _DataUtils.interpolateNumber)(prev.size, entry.size);
        return _objectSpread(_objectSpread({}, entry), {}, {
          cx: interpolatorCx(t),
          cy: interpolatorCy(t),
          size: interpolatorSize(t)
        });
      }
      const interpolator = (0, _DataUtils.interpolateNumber)(0, entry.size);
      return _objectSpread(_objectSpread({}, entry), {}, {
        size: interpolator(t)
      });
    });
    if (t > 0) {
      // eslint-disable-next-line no-param-reassign
      previousPointsRef.current = stepData;
    }
    return /*#__PURE__*/React.createElement(_Layer.Layer, null, /*#__PURE__*/React.createElement(ScatterSymbols, {
      points: stepData,
      allOtherScatterProps: props,
      showLabels: showLabels
    }));
  }), /*#__PURE__*/React.createElement(_LabelList.LabelListFromLabelProp, {
    label: props.label
  }));
}
function getTooltipEntrySettings(props) {
  const {
    dataKey,
    points,
    stroke,
    strokeWidth,
    fill,
    name,
    hide,
    tooltipType
  } = props;
  return {
    dataDefinedOnItem: points === null || points === void 0 ? void 0 : points.map(p => p.tooltipPayload),
    positions: points === null || points === void 0 ? void 0 : points.map(p => p.tooltipPosition),
    settings: {
      stroke,
      strokeWidth,
      fill,
      nameKey: undefined,
      dataKey,
      name: (0, _ChartUtils.getTooltipNameProp)(name, dataKey),
      hide,
      type: tooltipType,
      color: fill,
      unit: '' // why doesn't Scatter support unit?
    }
  };
}
function computeScatterPoints(_ref4) {
  const {
    displayedData,
    xAxis,
    yAxis,
    zAxis,
    scatterSettings,
    xAxisTicks,
    yAxisTicks,
    cells
  } = _ref4;
  const xAxisDataKey = (0, _DataUtils.isNullish)(xAxis.dataKey) ? scatterSettings.dataKey : xAxis.dataKey;
  const yAxisDataKey = (0, _DataUtils.isNullish)(yAxis.dataKey) ? scatterSettings.dataKey : yAxis.dataKey;
  const zAxisDataKey = zAxis && zAxis.dataKey;
  const defaultRangeZ = zAxis ? zAxis.range : _ZAxis.ZAxis.defaultProps.range;
  const defaultZ = defaultRangeZ && defaultRangeZ[0];
  const xBandSize = xAxis.scale.bandwidth ? xAxis.scale.bandwidth() : 0;
  const yBandSize = yAxis.scale.bandwidth ? yAxis.scale.bandwidth() : 0;
  return displayedData.map((entry, index) => {
    const x = (0, _ChartUtils.getValueByDataKey)(entry, xAxisDataKey);
    const y = (0, _ChartUtils.getValueByDataKey)(entry, yAxisDataKey);
    const z = !(0, _DataUtils.isNullish)(zAxisDataKey) && (0, _ChartUtils.getValueByDataKey)(entry, zAxisDataKey) || '-';
    const tooltipPayload = [{
      // @ts-expect-error name prop should not have dataKey in it
      name: (0, _DataUtils.isNullish)(xAxis.dataKey) ? scatterSettings.name : xAxis.name || xAxis.dataKey,
      unit: xAxis.unit || '',
      // @ts-expect-error getValueByDataKey does not validate the output type
      value: x,
      payload: entry,
      dataKey: xAxisDataKey,
      type: scatterSettings.tooltipType
    }, {
      // @ts-expect-error name prop should not have dataKey in it
      name: (0, _DataUtils.isNullish)(yAxis.dataKey) ? scatterSettings.name : yAxis.name || yAxis.dataKey,
      unit: yAxis.unit || '',
      // @ts-expect-error getValueByDataKey does not validate the output type
      value: y,
      payload: entry,
      dataKey: yAxisDataKey,
      type: scatterSettings.tooltipType
    }];
    if (z !== '-') {
      tooltipPayload.push({
        // @ts-expect-error name prop should not have dataKey in it
        name: zAxis.name || zAxis.dataKey,
        unit: zAxis.unit || '',
        // @ts-expect-error getValueByDataKey does not validate the output type
        value: z,
        payload: entry,
        dataKey: zAxisDataKey,
        type: scatterSettings.tooltipType
      });
    }
    const cx = (0, _ChartUtils.getCateCoordinateOfLine)({
      axis: xAxis,
      ticks: xAxisTicks,
      bandSize: xBandSize,
      entry,
      index,
      dataKey: xAxisDataKey
    });
    const cy = (0, _ChartUtils.getCateCoordinateOfLine)({
      axis: yAxis,
      ticks: yAxisTicks,
      bandSize: yBandSize,
      entry,
      index,
      dataKey: yAxisDataKey
    });
    const size = z !== '-' ? zAxis.scale(z) : defaultZ;
    const radius = Math.sqrt(Math.max(size, 0) / Math.PI);
    return _objectSpread(_objectSpread({}, entry), {}, {
      cx,
      cy,
      x: cx - radius,
      y: cy - radius,
      width: 2 * radius,
      height: 2 * radius,
      size,
      node: {
        x,
        y,
        z
      },
      tooltipPayload,
      tooltipPosition: {
        x: cx,
        y: cy
      },
      payload: entry
    }, cells && cells[index] && cells[index].props);
  });
}
const errorBarDataPointFormatter = (dataPoint, dataKey, direction) => {
  return {
    x: dataPoint.cx,
    y: dataPoint.cy,
    value: direction === 'x' ? +dataPoint.node.x : +dataPoint.node.y,
    // @ts-expect-error getValueByDataKey does not validate the output type
    errorVal: (0, _ChartUtils.getValueByDataKey)(dataPoint, dataKey)
  };
};
function ScatterWithId(props) {
  const {
    hide,
    points,
    className,
    needClip,
    xAxisId,
    yAxisId,
    id
  } = props;
  const previousPointsRef = (0, _react.useRef)(null);
  if (hide) {
    return null;
  }
  const layerClass = (0, _clsx.clsx)('recharts-scatter', className);
  const clipPathId = id;
  return /*#__PURE__*/React.createElement(_Layer.Layer, {
    className: layerClass,
    clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : null,
    id: id
  }, needClip && /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement(_GraphicalItemClipPath.GraphicalItemClipPath, {
    clipPathId: clipPathId,
    xAxisId: xAxisId,
    yAxisId: yAxisId
  })), /*#__PURE__*/React.createElement(_ErrorBarContext.SetErrorBarContext, {
    xAxisId: xAxisId,
    yAxisId: yAxisId,
    data: points,
    dataPointFormatter: errorBarDataPointFormatter,
    errorBarOffset: 0
  }, /*#__PURE__*/React.createElement(_Layer.Layer, {
    key: "recharts-scatter-symbols"
  }, /*#__PURE__*/React.createElement(SymbolsWithAnimation, {
    props: props,
    previousPointsRef: previousPointsRef
  }))));
}
const defaultScatterProps = {
  xAxisId: 0,
  yAxisId: 0,
  zAxisId: 0,
  legendType: 'circle',
  lineType: 'joint',
  lineJointType: 'linear',
  data: [],
  shape: 'circle',
  hide: false,
  isAnimationActive: !_Global.Global.isSsr,
  animationBegin: 0,
  animationDuration: 400,
  animationEasing: 'linear'
};
function ScatterImpl(props) {
  const _resolveDefaultProps = (0, _resolveDefaultProps2.resolveDefaultProps)(props, defaultScatterProps),
    {
      animationBegin,
      animationDuration,
      animationEasing,
      hide,
      isAnimationActive,
      legendType,
      lineJointType,
      lineType,
      shape,
      xAxisId,
      yAxisId,
      zAxisId
    } = _resolveDefaultProps,
    everythingElse = _objectWithoutProperties(_resolveDefaultProps, _excluded3);
  const {
    needClip
  } = (0, _GraphicalItemClipPath.useNeedsClip)(xAxisId, yAxisId);
  const cells = (0, _react.useMemo)(() => (0, _ReactUtils.findAllByType)(props.children, _Cell.Cell), [props.children]);
  const isPanorama = (0, _PanoramaContext.useIsPanorama)();
  const points = (0, _hooks.useAppSelector)(state => {
    return (0, _scatterSelectors.selectScatterPoints)(state, xAxisId, yAxisId, zAxisId, props.id, cells, isPanorama);
  });
  if (needClip == null) {
    return null;
  }
  if (points == null) {
    return null;
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_SetTooltipEntrySettings.SetTooltipEntrySettings, {
    fn: getTooltipEntrySettings,
    args: _objectSpread(_objectSpread({}, props), {}, {
      points
    })
  }), /*#__PURE__*/React.createElement(ScatterWithId, _extends({}, everythingElse, {
    xAxisId: xAxisId,
    yAxisId: yAxisId,
    zAxisId: zAxisId,
    lineType: lineType,
    lineJointType: lineJointType,
    legendType: legendType,
    shape: shape,
    hide: hide,
    isAnimationActive: isAnimationActive,
    animationBegin: animationBegin,
    animationDuration: animationDuration,
    animationEasing: animationEasing,
    points: points,
    needClip: needClip
  })));
}
function ScatterFn(outsideProps) {
  const props = (0, _resolveDefaultProps2.resolveDefaultProps)(outsideProps, defaultScatterProps);
  const isPanorama = (0, _PanoramaContext.useIsPanorama)();
  return /*#__PURE__*/React.createElement(_RegisterGraphicalItemId.RegisterGraphicalItemId, {
    id: props.id,
    type: "scatter"
  }, id => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_SetLegendPayload.SetLegendPayload, {
    legendPayload: computeLegendPayloadFromScatterProps(props)
  }), /*#__PURE__*/React.createElement(_SetGraphicalItem.SetCartesianGraphicalItem, {
    type: "scatter",
    id: id,
    data: props.data,
    xAxisId: props.xAxisId,
    yAxisId: props.yAxisId,
    zAxisId: props.zAxisId,
    dataKey: props.dataKey,
    hide: props.hide,
    name: props.name,
    tooltipType: props.tooltipType,
    isPanorama: isPanorama
  }), /*#__PURE__*/React.createElement(ScatterImpl, _extends({}, props, {
    id: id
  }))));
}
const Scatter = exports.Scatter = /*#__PURE__*/React.memo(ScatterFn);
Scatter.displayName = 'Scatter';
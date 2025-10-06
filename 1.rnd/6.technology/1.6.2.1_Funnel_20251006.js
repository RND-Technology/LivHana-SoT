"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FunnelWithState = exports.Funnel = void 0;
exports.computeFunnelTrapezoids = computeFunnelTrapezoids;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _omit = _interopRequireDefault(require("es-toolkit/compat/omit"));
const _clsx = require("clsx");
const _selectors = require("../state/selectors/selectors");
const _hooks = require("../state/hooks");
const _Layer = require("../container/Layer");
const _LabelList = require("../component/LabelList");
const _Global = require("../util/Global");
const _DataUtils = require("../util/DataUtils");
const _ChartUtils = require("../util/ChartUtils");
const _types = require("../util/types");
const _FunnelUtils = require("../util/FunnelUtils");
const _tooltipContext = require("../context/tooltipContext");
const _SetTooltipEntrySettings = require("../state/SetTooltipEntrySettings");
const _funnelSelectors = require("../state/selectors/funnelSelectors");
const _ReactUtils = require("../util/ReactUtils");
const _Cell = require("../component/Cell");
const _resolveDefaultProps2 = require("../util/resolveDefaultProps");
const _hooks2 = require("../hooks");
const _svgPropertiesNoEvents = require("../util/svgPropertiesNoEvents");
const _JavascriptAnimate = require("../animation/JavascriptAnimate");
const _useAnimationId = require("../util/useAnimationId");
const _excluded = ["onMouseEnter", "onClick", "onMouseLeave", "shape", "activeShape"],
  _excluded2 = ["stroke", "fill", "legendType", "hide", "isAnimationActive", "animationBegin", "animationDuration", "animationEasing", "nameKey", "lastShapeType"];
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /* eslint-disable max-classes-per-file */
/**
 * Internal props, combination of external props + defaultProps + private Recharts state
 */

/**
 * External props, intended for end users to fill in
 */

function getTooltipEntrySettings(props) {
  const {
    dataKey,
    nameKey,
    stroke,
    strokeWidth,
    fill,
    name,
    hide,
    tooltipType,
    data
  } = props;
  return {
    dataDefinedOnItem: data,
    positions: props.trapezoids.map(_ref => {
      const {
        tooltipPosition
      } = _ref;
      return tooltipPosition;
    }),
    settings: {
      stroke,
      strokeWidth,
      fill,
      dataKey,
      name,
      nameKey,
      hide,
      type: tooltipType,
      color: fill,
      unit: '' // Funnel does not have unit, why?
    }
  };
}
function FunnelLabelListProvider(_ref2) {
  const {
    showLabels,
    trapezoids,
    children
  } = _ref2;
  const labelListEntries = (0, _react.useMemo)(() => {
    if (!showLabels) {
      return undefined;
    }
    return trapezoids === null || trapezoids === void 0 ? void 0 : trapezoids.map(entry => {
      const viewBox = {
        x: entry.x,
        y: entry.y,
        // Label positions in Funnel are calculated relative to upperWidth so that's what we need to pass here as "width"
        width: entry.upperWidth,
        height: entry.height
      };
      return _objectSpread(_objectSpread({}, viewBox), {}, {
        value: entry.name,
        payload: entry.payload,
        parentViewBox: undefined,
        viewBox,
        fill: entry.fill
      });
    });
  }, [showLabels, trapezoids]);
  return /*#__PURE__*/React.createElement(_LabelList.CartesianLabelListContextProvider, {
    value: labelListEntries
  }, children);
}
function FunnelTrapezoids(props) {
  const {
    trapezoids,
    allOtherFunnelProps
  } = props;
  const activeItemIndex = (0, _hooks.useAppSelector)(state => (0, _selectors.selectActiveIndex)(state, 'item', state.tooltip.settings.trigger, undefined));
  let {
      onMouseEnter: onMouseEnterFromProps,
      onClick: onItemClickFromProps,
      onMouseLeave: onMouseLeaveFromProps,
      shape,
      activeShape
    } = allOtherFunnelProps,
    restOfAllOtherProps = _objectWithoutProperties(allOtherFunnelProps, _excluded);
  const onMouseEnterFromContext = (0, _tooltipContext.useMouseEnterItemDispatch)(onMouseEnterFromProps, allOtherFunnelProps.dataKey);
  const onMouseLeaveFromContext = (0, _tooltipContext.useMouseLeaveItemDispatch)(onMouseLeaveFromProps);
  const onClickFromContext = (0, _tooltipContext.useMouseClickItemDispatch)(onItemClickFromProps, allOtherFunnelProps.dataKey);
  return /*#__PURE__*/React.createElement(React.Fragment, null, trapezoids.map((entry, i) => {
    const isActiveIndex = Boolean(activeShape) && activeItemIndex === String(i);
    const trapezoidOptions = isActiveIndex ? activeShape : shape;
    const trapezoidProps = _objectSpread(_objectSpread({}, entry), {}, {
      option: trapezoidOptions,
      isActive: isActiveIndex,
      stroke: entry.stroke
    });
    return /*#__PURE__*/React.createElement(_Layer.Layer, _extends({
      className: "recharts-funnel-trapezoid"
    }, (0, _types.adaptEventsOfChild)(restOfAllOtherProps, entry, i), {
      // @ts-expect-error the types need a bit of attention
      onMouseEnter: onMouseEnterFromContext(entry, i)
      // @ts-expect-error the types need a bit of attention
      ,
      onMouseLeave: onMouseLeaveFromContext(entry, i)
      // @ts-expect-error the types need a bit of attention
      ,
      onClick: onClickFromContext(entry, i),
      key: "trapezoid-".concat(entry === null || entry === void 0 ? void 0 : entry.x, "-").concat(entry === null || entry === void 0 ? void 0 : entry.y, "-").concat(entry === null || entry === void 0 ? void 0 : entry.name, "-").concat(entry === null || entry === void 0 ? void 0 : entry.value)
    }), /*#__PURE__*/React.createElement(_FunnelUtils.FunnelTrapezoid, trapezoidProps));
  }));
}
function TrapezoidsWithAnimation(_ref3) {
  const {
    previousTrapezoidsRef,
    props
  } = _ref3;
  const {
    trapezoids,
    isAnimationActive,
    animationBegin,
    animationDuration,
    animationEasing,
    onAnimationEnd,
    onAnimationStart
  } = props;
  const prevTrapezoids = previousTrapezoidsRef.current;
  const [isAnimating, setIsAnimating] = (0, _react.useState)(false);
  const showLabels = !isAnimating;
  const animationId = (0, _useAnimationId.useAnimationId)(trapezoids, 'recharts-funnel-');
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
  return /*#__PURE__*/React.createElement(FunnelLabelListProvider, {
    showLabels: showLabels,
    trapezoids: trapezoids
  }, /*#__PURE__*/React.createElement(_JavascriptAnimate.JavascriptAnimate, {
    animationId: animationId,
    begin: animationBegin,
    duration: animationDuration,
    isActive: isAnimationActive,
    easing: animationEasing,
    key: animationId,
    onAnimationStart: handleAnimationStart,
    onAnimationEnd: handleAnimationEnd
  }, t => {
    const stepData = t === 1 ? trapezoids : trapezoids.map((entry, index) => {
      const prev = prevTrapezoids && prevTrapezoids[index];
      if (prev) {
        return _objectSpread(_objectSpread({}, entry), {}, {
          x: (0, _DataUtils.interpolate)(prev.x, entry.x, t),
          y: (0, _DataUtils.interpolate)(prev.y, entry.y, t),
          upperWidth: (0, _DataUtils.interpolate)(prev.upperWidth, entry.upperWidth, t),
          lowerWidth: (0, _DataUtils.interpolate)(prev.lowerWidth, entry.lowerWidth, t),
          height: (0, _DataUtils.interpolate)(prev.height, entry.height, t)
        });
      }
      return _objectSpread(_objectSpread({}, entry), {}, {
        x: (0, _DataUtils.interpolate)(entry.x + entry.upperWidth / 2, entry.x, t),
        y: (0, _DataUtils.interpolate)(entry.y + entry.height / 2, entry.y, t),
        upperWidth: (0, _DataUtils.interpolate)(0, entry.upperWidth, t),
        lowerWidth: (0, _DataUtils.interpolate)(0, entry.lowerWidth, t),
        height: (0, _DataUtils.interpolate)(0, entry.height, t)
      });
    });
    if (t > 0) {
      // eslint-disable-next-line no-param-reassign
      previousTrapezoidsRef.current = stepData;
    }
    return /*#__PURE__*/React.createElement(_Layer.Layer, null, /*#__PURE__*/React.createElement(FunnelTrapezoids, {
      trapezoids: stepData,
      allOtherFunnelProps: props
    }));
  }), /*#__PURE__*/React.createElement(_LabelList.LabelListFromLabelProp, {
    label: props.label
  }), props.children);
}
function RenderTrapezoids(props) {
  const previousTrapezoidsRef = (0, _react.useRef)(undefined);
  return /*#__PURE__*/React.createElement(TrapezoidsWithAnimation, {
    props: props,
    previousTrapezoidsRef: previousTrapezoidsRef
  });
}
const getRealWidthHeight = (customWidth, offset) => {
  const {
    width,
    height,
    left,
    right,
    top,
    bottom
  } = offset;
  const realHeight = height;
  let realWidth = width;
  if ((0, _DataUtils.isNumber)(customWidth)) {
    realWidth = customWidth;
  } else if (typeof customWidth === 'string') {
    realWidth = realWidth * parseFloat(customWidth) / 100;
  }
  return {
    realWidth: realWidth - left - right - 50,
    realHeight: realHeight - bottom - top,
    offsetX: (width - realWidth) / 2,
    offsetY: (height - realHeight) / 2
  };
};
class FunnelWithState extends _react.PureComponent {
  render() {
    const {
      className
    } = this.props;
    const layerClass = (0, _clsx.clsx)('recharts-trapezoids', className);
    return /*#__PURE__*/React.createElement(_Layer.Layer, {
      className: layerClass
    }, /*#__PURE__*/React.createElement(RenderTrapezoids, this.props));
  }
}
exports.FunnelWithState = FunnelWithState;
const defaultFunnelProps = {
  stroke: '#fff',
  fill: '#808080',
  legendType: 'rect',
  hide: false,
  isAnimationActive: !_Global.Global.isSsr,
  animationBegin: 400,
  animationDuration: 1500,
  animationEasing: 'ease',
  nameKey: 'name',
  lastShapeType: 'triangle'
};
function FunnelImpl(props) {
  const plotArea = (0, _hooks2.usePlotArea)();
  const _resolveDefaultProps = (0, _resolveDefaultProps2.resolveDefaultProps)(props, defaultFunnelProps),
    {
      stroke,
      fill,
      legendType,
      hide,
      isAnimationActive,
      animationBegin,
      animationDuration,
      animationEasing,
      nameKey,
      lastShapeType
    } = _resolveDefaultProps,
    everythingElse = _objectWithoutProperties(_resolveDefaultProps, _excluded2);
  const presentationProps = (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(props);
  const cells = (0, _ReactUtils.findAllByType)(props.children, _Cell.Cell);
  const funnelSettings = (0, _react.useMemo)(() => ({
    dataKey: props.dataKey,
    nameKey,
    data: props.data,
    tooltipType: props.tooltipType,
    lastShapeType,
    reversed: props.reversed,
    customWidth: props.width,
    cells,
    presentationProps
  }), [props.dataKey, nameKey, props.data, props.tooltipType, lastShapeType, props.reversed, props.width, cells, presentationProps]);
  const trapezoids = (0, _hooks.useAppSelector)(state => (0, _funnelSelectors.selectFunnelTrapezoids)(state, funnelSettings));
  if (hide || !trapezoids || !trapezoids.length || !plotArea) {
    return null;
  }
  const {
    height,
    width
  } = plotArea;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_SetTooltipEntrySettings.SetTooltipEntrySettings, {
    fn: getTooltipEntrySettings,
    args: _objectSpread(_objectSpread({}, props), {}, {
      trapezoids
    })
  }), /*#__PURE__*/React.createElement(FunnelWithState, _extends({}, everythingElse, {
    stroke: stroke,
    fill: fill,
    nameKey: nameKey,
    lastShapeType: lastShapeType,
    animationBegin: animationBegin,
    animationDuration: animationDuration,
    animationEasing: animationEasing,
    isAnimationActive: isAnimationActive,
    hide: hide,
    legendType: legendType,
    height: height,
    width: width,
    trapezoids: trapezoids
  })));
}
function computeFunnelTrapezoids(_ref4) {
  const {
    dataKey,
    nameKey,
    displayedData,
    tooltipType,
    lastShapeType,
    reversed,
    offset,
    customWidth
  } = _ref4;
  const {
    left,
    top
  } = offset;
  const {
    realHeight,
    realWidth,
    offsetX,
    offsetY
  } = getRealWidthHeight(customWidth, offset);
  const maxValue = Math.max.apply(null, displayedData.map(entry => (0, _ChartUtils.getValueByDataKey)(entry, dataKey, 0)));
  const len = displayedData.length;
  const rowHeight = realHeight / len;
  const parentViewBox = {
    x: offset.left,
    y: offset.top,
    width: offset.width,
    height: offset.height
  };
  let trapezoids = displayedData.map((entry, i) => {
    const rawVal = (0, _ChartUtils.getValueByDataKey)(entry, dataKey, 0);
    const name = (0, _ChartUtils.getValueByDataKey)(entry, nameKey, i);
    let val = rawVal;
    let nextVal;
    if (i !== len - 1) {
      nextVal = (0, _ChartUtils.getValueByDataKey)(displayedData[i + 1], dataKey, 0);
      if (nextVal instanceof Array) {
        [nextVal] = nextVal;
      }
    } else if (rawVal instanceof Array && rawVal.length === 2) {
      [val, nextVal] = rawVal;
    } else if (lastShapeType === 'rectangle') {
      nextVal = val;
    } else {
      nextVal = 0;
    }

    // @ts-expect-error getValueByDataKey does not validate the output type
    const x = (maxValue - val) * realWidth / (2 * maxValue) + top + 25 + offsetX;
    const y = rowHeight * i + left + offsetY;
    // @ts-expect-error getValueByDataKey does not validate the output type
    const upperWidth = val / maxValue * realWidth;
    const lowerWidth = nextVal / maxValue * realWidth;
    const tooltipPayload = [{
      name,
      value: val,
      payload: entry,
      dataKey,
      type: tooltipType
    }];
    const tooltipPosition = {
      x: x + upperWidth / 2,
      y: y + rowHeight / 2
    };
    return _objectSpread(_objectSpread({
      x,
      y,
      width: Math.max(upperWidth, lowerWidth),
      upperWidth,
      lowerWidth,
      height: rowHeight,
      // @ts-expect-error getValueByDataKey does not validate the output type
      name,
      val,
      tooltipPayload,
      tooltipPosition
    }, (0, _omit.default)(entry, ['width'])), {}, {
      payload: entry,
      parentViewBox,
      labelViewBox: {
        x: x + (upperWidth - lowerWidth) / 4,
        y,
        width: Math.abs(upperWidth - lowerWidth) / 2 + Math.min(upperWidth, lowerWidth),
        height: rowHeight
      }
    });
  });
  if (reversed) {
    trapezoids = trapezoids.map((entry, index) => {
      const newY = entry.y - index * rowHeight + (len - 1 - index) * rowHeight;
      return _objectSpread(_objectSpread({}, entry), {}, {
        upperWidth: entry.lowerWidth,
        lowerWidth: entry.upperWidth,
        x: entry.x - (entry.lowerWidth - entry.upperWidth) / 2,
        y: entry.y - index * rowHeight + (len - 1 - index) * rowHeight,
        tooltipPosition: _objectSpread(_objectSpread({}, entry.tooltipPosition), {}, {
          y: newY + rowHeight / 2
        }),
        labelViewBox: _objectSpread(_objectSpread({}, entry.labelViewBox), {}, {
          y: newY
        })
      });
    });
  }
  return trapezoids;
}
class Funnel extends _react.PureComponent {
  render() {
    return /*#__PURE__*/React.createElement(FunnelImpl, this.props);
  }
}
exports.Funnel = Funnel;
_defineProperty(Funnel, "displayName", 'Funnel');
_defineProperty(Funnel, "defaultProps", defaultFunnelProps);
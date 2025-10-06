"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RadialBar = void 0;
exports.computeRadialBarDataItems = computeRadialBarDataItems;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _clsx = require("clsx");
const _RadialBarUtils = require("../util/RadialBarUtils");
const _Layer = require("../container/Layer");
const _ReactUtils = require("../util/ReactUtils");
const _Global = require("../util/Global");
const _LabelList = require("../component/LabelList");
const _Cell = require("../component/Cell");
const _DataUtils = require("../util/DataUtils");
const _ChartUtils = require("../util/ChartUtils");
const _types = require("../util/types");
const _tooltipContext = require("../context/tooltipContext");
const _SetTooltipEntrySettings = require("../state/SetTooltipEntrySettings");
const _radialBarSelectors = require("../state/selectors/radialBarSelectors");
const _hooks = require("../state/hooks");
const _tooltipSelectors = require("../state/selectors/tooltipSelectors");
const _SetLegendPayload = require("../state/SetLegendPayload");
const _useAnimationId = require("../util/useAnimationId");
const _RegisterGraphicalItemId = require("../context/RegisterGraphicalItemId");
const _SetGraphicalItem = require("../state/SetGraphicalItem");
const _svgPropertiesNoEvents = require("../util/svgPropertiesNoEvents");
const _JavascriptAnimate = require("../animation/JavascriptAnimate");
const _excluded = ["shape", "activeShape", "cornerRadius", "id"],
  _excluded2 = ["onMouseEnter", "onClick", "onMouseLeave"],
  _excluded3 = ["value", "background"]; // eslint-disable-next-line max-classes-per-file
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
const STABLE_EMPTY_ARRAY = [];
function RadialBarLabelListProvider(_ref) {
  const {
    showLabels,
    sectors,
    children
  } = _ref;
  const labelListEntries = sectors.map(sector => ({
    value: sector.value,
    payload: sector.payload,
    parentViewBox: undefined,
    clockWise: false,
    viewBox: {
      cx: sector.cx,
      cy: sector.cy,
      innerRadius: sector.innerRadius,
      outerRadius: sector.outerRadius,
      startAngle: sector.startAngle,
      endAngle: sector.endAngle,
      clockWise: false
    },
    fill: sector.fill
  }));
  return /*#__PURE__*/React.createElement(_LabelList.PolarLabelListContextProvider, {
    value: showLabels ? labelListEntries : null
  }, children);
}
function RadialBarSectors(_ref2) {
  const {
    sectors,
    allOtherRadialBarProps,
    showLabels
  } = _ref2;
  let {
      shape,
      activeShape,
      cornerRadius,
      id
    } = allOtherRadialBarProps,
    others = _objectWithoutProperties(allOtherRadialBarProps, _excluded);
  const baseProps = (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(others);
  const activeIndex = (0, _hooks.useAppSelector)(_tooltipSelectors.selectActiveTooltipIndex);
  let {
      onMouseEnter: onMouseEnterFromProps,
      onClick: onItemClickFromProps,
      onMouseLeave: onMouseLeaveFromProps
    } = allOtherRadialBarProps,
    restOfAllOtherProps = _objectWithoutProperties(allOtherRadialBarProps, _excluded2);
  const onMouseEnterFromContext = (0, _tooltipContext.useMouseEnterItemDispatch)(onMouseEnterFromProps, allOtherRadialBarProps.dataKey);
  const onMouseLeaveFromContext = (0, _tooltipContext.useMouseLeaveItemDispatch)(onMouseLeaveFromProps);
  const onClickFromContext = (0, _tooltipContext.useMouseClickItemDispatch)(onItemClickFromProps, allOtherRadialBarProps.dataKey);
  if (sectors == null) {
    return null;
  }
  return /*#__PURE__*/React.createElement(RadialBarLabelListProvider, {
    showLabels: showLabels,
    sectors: sectors
  }, sectors.map((entry, i) => {
    const isActive = activeShape && activeIndex === String(i);
    // @ts-expect-error the types need a bit of attention
    const onMouseEnter = onMouseEnterFromContext(entry, i);
    // @ts-expect-error the types need a bit of attention
    const onMouseLeave = onMouseLeaveFromContext(entry, i);
    // @ts-expect-error the types need a bit of attention
    const onClick = onClickFromContext(entry, i);

    // @ts-expect-error cx types are incompatible
    const radialBarSectorProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, baseProps), {}, {
      cornerRadius: (0, _RadialBarUtils.parseCornerRadius)(cornerRadius)
    }, entry), (0, _types.adaptEventsOfChild)(restOfAllOtherProps, entry, i)), {}, {
      onMouseEnter,
      onMouseLeave,
      onClick,
      key: "sector-".concat(i),
      className: "recharts-radial-bar-sector ".concat(entry.className),
      forceCornerRadius: others.forceCornerRadius,
      cornerIsExternal: others.cornerIsExternal,
      isActive,
      option: isActive ? activeShape : shape
    });
    return /*#__PURE__*/React.createElement(_RadialBarUtils.RadialBarSector, radialBarSectorProps);
  }), /*#__PURE__*/React.createElement(_LabelList.LabelListFromLabelProp, {
    label: allOtherRadialBarProps.label
  }), allOtherRadialBarProps.children);
}
function SectorsWithAnimation(_ref3) {
  const {
    props,
    previousSectorsRef
  } = _ref3;
  const {
    data,
    isAnimationActive,
    animationBegin,
    animationDuration,
    animationEasing,
    onAnimationEnd,
    onAnimationStart
  } = props;
  const animationId = (0, _useAnimationId.useAnimationId)(props, 'recharts-radialbar-');
  const prevData = previousSectorsRef.current;
  const [isAnimating, setIsAnimating] = (0, _react.useState)(false);
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
  return /*#__PURE__*/React.createElement(_JavascriptAnimate.JavascriptAnimate, {
    animationId: animationId,
    begin: animationBegin,
    duration: animationDuration,
    isActive: isAnimationActive,
    easing: animationEasing,
    onAnimationStart: handleAnimationStart,
    onAnimationEnd: handleAnimationEnd,
    key: animationId
  }, t => {
    const stepData = t === 1 ? data : (data !== null && data !== void 0 ? data : STABLE_EMPTY_ARRAY).map((entry, index) => {
      const prev = prevData && prevData[index];
      if (prev) {
        const interpolatorStartAngle = (0, _DataUtils.interpolateNumber)(prev.startAngle, entry.startAngle);
        const interpolatorEndAngle = (0, _DataUtils.interpolateNumber)(prev.endAngle, entry.endAngle);
        return _objectSpread(_objectSpread({}, entry), {}, {
          startAngle: interpolatorStartAngle(t),
          endAngle: interpolatorEndAngle(t)
        });
      }
      const {
        endAngle,
        startAngle
      } = entry;
      const interpolator = (0, _DataUtils.interpolateNumber)(startAngle, endAngle);
      return _objectSpread(_objectSpread({}, entry), {}, {
        endAngle: interpolator(t)
      });
    });
    if (t > 0) {
      // eslint-disable-next-line no-param-reassign
      previousSectorsRef.current = stepData !== null && stepData !== void 0 ? stepData : null;
    }
    return /*#__PURE__*/React.createElement(_Layer.Layer, null, /*#__PURE__*/React.createElement(RadialBarSectors, {
      sectors: stepData !== null && stepData !== void 0 ? stepData : STABLE_EMPTY_ARRAY,
      allOtherRadialBarProps: props,
      showLabels: !isAnimating
    }));
  });
}
function RenderSectors(props) {
  const previousSectorsRef = (0, _react.useRef)(null);
  return /*#__PURE__*/React.createElement(SectorsWithAnimation, {
    props: props,
    previousSectorsRef: previousSectorsRef
  });
}
function SetRadialBarPayloadLegend(props) {
  const legendPayload = (0, _hooks.useAppSelector)(state => (0, _radialBarSelectors.selectRadialBarLegendPayload)(state, props.legendType));
  return /*#__PURE__*/React.createElement(_SetLegendPayload.SetPolarLegendPayload, {
    legendPayload: legendPayload !== null && legendPayload !== void 0 ? legendPayload : []
  });
}
function getTooltipEntrySettings(props) {
  const {
    dataKey,
    data,
    stroke,
    strokeWidth,
    name,
    hide,
    fill,
    tooltipType
  } = props;
  return {
    dataDefinedOnItem: data,
    positions: undefined,
    settings: {
      stroke,
      strokeWidth,
      fill,
      nameKey: undefined,
      // RadialBar does not have nameKey, why?
      dataKey,
      name: (0, _ChartUtils.getTooltipNameProp)(name, dataKey),
      hide,
      type: tooltipType,
      color: fill,
      unit: '' // Why does RadialBar not support unit?
    }
  };
}
class RadialBarWithState extends _react.PureComponent {
  renderBackground(sectors) {
    if (sectors == null) {
      return null;
    }
    const {
      cornerRadius
    } = this.props;
    const backgroundProps = (0, _ReactUtils.filterProps)(this.props.background, false);
    return sectors.map((entry, i) => {
      let {
          value,
          background
        } = entry,
        rest = _objectWithoutProperties(entry, _excluded3);
      if (!background) {
        return null;
      }
      const props = _objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({
        cornerRadius: (0, _RadialBarUtils.parseCornerRadius)(cornerRadius)
      }, rest), {}, {
        fill: '#eee'
      }, background), backgroundProps), (0, _types.adaptEventsOfChild)(this.props, entry, i)), {}, {
        index: i,
        key: "sector-".concat(i),
        className: (0, _clsx.clsx)('recharts-radial-bar-background-sector', backgroundProps === null || backgroundProps === void 0 ? void 0 : backgroundProps.className),
        option: background,
        isActive: false
      });
      return /*#__PURE__*/React.createElement(_RadialBarUtils.RadialBarSector, props);
    });
  }
  render() {
    const {
      hide,
      data,
      className,
      background
    } = this.props;
    if (hide) {
      return null;
    }
    const layerClass = (0, _clsx.clsx)('recharts-area', className);
    return /*#__PURE__*/React.createElement(_Layer.Layer, {
      className: layerClass
    }, background && /*#__PURE__*/React.createElement(_Layer.Layer, {
      className: "recharts-radial-bar-background"
    }, this.renderBackground(data)), /*#__PURE__*/React.createElement(_Layer.Layer, {
      className: "recharts-radial-bar-sectors"
    }, /*#__PURE__*/React.createElement(RenderSectors, this.props)));
  }
}
function RadialBarImpl(props) {
  let _useAppSelector;
  const cells = (0, _ReactUtils.findAllByType)(props.children, _Cell.Cell);
  const radialBarSettings = {
    data: undefined,
    hide: false,
    id: props.id,
    dataKey: props.dataKey,
    minPointSize: props.minPointSize,
    stackId: (0, _ChartUtils.getNormalizedStackId)(props.stackId),
    maxBarSize: props.maxBarSize,
    barSize: props.barSize,
    type: 'radialBar',
    angleAxisId: props.angleAxisId,
    radiusAxisId: props.radiusAxisId
  };
  const data = (_useAppSelector = (0, _hooks.useAppSelector)(state => (0, _radialBarSelectors.selectRadialBarSectors)(state, props.radiusAxisId, props.angleAxisId, radialBarSettings, cells))) !== null && _useAppSelector !== void 0 ? _useAppSelector : STABLE_EMPTY_ARRAY;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_SetTooltipEntrySettings.SetTooltipEntrySettings, {
    fn: getTooltipEntrySettings,
    args: _objectSpread(_objectSpread({}, props), {}, {
      data
    })
  }), /*#__PURE__*/React.createElement(RadialBarWithState, _extends({}, props, {
    data: data
  })));
}
const defaultRadialBarProps = {
  angleAxisId: 0,
  radiusAxisId: 0,
  minPointSize: 0,
  hide: false,
  legendType: 'rect',
  data: [],
  isAnimationActive: !_Global.Global.isSsr,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease',
  forceCornerRadius: false,
  cornerIsExternal: false
};
function computeRadialBarDataItems(_ref4) {
  const {
    displayedData,
    stackedData,
    dataStartIndex,
    stackedDomain,
    dataKey,
    baseValue,
    layout,
    radiusAxis,
    radiusAxisTicks,
    bandSize,
    pos,
    angleAxis,
    minPointSize,
    cx,
    cy,
    angleAxisTicks,
    cells,
    startAngle: rootStartAngle,
    endAngle: rootEndAngle
  } = _ref4;
  return (displayedData !== null && displayedData !== void 0 ? displayedData : []).map((entry, index) => {
    let value, innerRadius, outerRadius, startAngle, endAngle, backgroundSector;
    if (stackedData) {
      // @ts-expect-error truncateByDomain expects only numerical domain, but it can received categorical domain too
      value = (0, _ChartUtils.truncateByDomain)(stackedData[dataStartIndex + index], stackedDomain);
    } else {
      value = (0, _ChartUtils.getValueByDataKey)(entry, dataKey);
      if (!Array.isArray(value)) {
        value = [baseValue, value];
      }
    }
    if (layout === 'radial') {
      innerRadius = (0, _ChartUtils.getCateCoordinateOfBar)({
        axis: radiusAxis,
        ticks: radiusAxisTicks,
        bandSize,
        offset: pos.offset,
        entry,
        index
      });
      endAngle = angleAxis.scale(value[1]);
      startAngle = angleAxis.scale(value[0]);
      outerRadius = (innerRadius !== null && innerRadius !== void 0 ? innerRadius : 0) + pos.size;
      const deltaAngle = endAngle - startAngle;
      if (Math.abs(minPointSize) > 0 && Math.abs(deltaAngle) < Math.abs(minPointSize)) {
        const delta = (0, _DataUtils.mathSign)(deltaAngle || minPointSize) * (Math.abs(minPointSize) - Math.abs(deltaAngle));
        endAngle += delta;
      }
      backgroundSector = {
        background: {
          cx,
          cy,
          innerRadius,
          outerRadius,
          startAngle: rootStartAngle,
          endAngle: rootEndAngle
        }
      };
    } else {
      innerRadius = radiusAxis.scale(value[0]);
      outerRadius = radiusAxis.scale(value[1]);
      startAngle = (0, _ChartUtils.getCateCoordinateOfBar)({
        axis: angleAxis,
        ticks: angleAxisTicks,
        bandSize,
        offset: pos.offset,
        entry,
        index
      });
      endAngle = (startAngle !== null && startAngle !== void 0 ? startAngle : 0) + pos.size;
      const deltaRadius = outerRadius - innerRadius;
      if (Math.abs(minPointSize) > 0 && Math.abs(deltaRadius) < Math.abs(minPointSize)) {
        const _delta = (0, _DataUtils.mathSign)(deltaRadius || minPointSize) * (Math.abs(minPointSize) - Math.abs(deltaRadius));
        outerRadius += _delta;
      }
    }
    return _objectSpread(_objectSpread(_objectSpread({}, entry), backgroundSector), {}, {
      payload: entry,
      value: stackedData ? value : value[1],
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle
    }, cells && cells[index] && cells[index].props);
  });
}
class RadialBar extends _react.PureComponent {
  render() {
    return /*#__PURE__*/React.createElement(_RegisterGraphicalItemId.RegisterGraphicalItemId, {
      id: this.props.id,
      type: "radialBar"
    }, id => {
      let _this$props$hide, _this$props$angleAxis, _this$props$radiusAxi;
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_SetGraphicalItem.SetPolarGraphicalItem, {
        type: "radialBar",
        id: id
        // TODO: do we need this anymore and is the below comment true? Strict nulls complains about it
        ,
        data: undefined // data prop is injected through generator and overwrites what user passes in
        ,
        dataKey: this.props.dataKey
        // TS is not smart enough to know defaultProps has values due to the explicit Partial type
        ,
        hide: (_this$props$hide = this.props.hide) !== null && _this$props$hide !== void 0 ? _this$props$hide : defaultRadialBarProps.hide,
        angleAxisId: (_this$props$angleAxis = this.props.angleAxisId) !== null && _this$props$angleAxis !== void 0 ? _this$props$angleAxis : defaultRadialBarProps.angleAxisId,
        radiusAxisId: (_this$props$radiusAxi = this.props.radiusAxisId) !== null && _this$props$radiusAxi !== void 0 ? _this$props$radiusAxi : defaultRadialBarProps.radiusAxisId,
        stackId: (0, _ChartUtils.getNormalizedStackId)(this.props.stackId),
        barSize: this.props.barSize,
        minPointSize: this.props.minPointSize,
        maxBarSize: this.props.maxBarSize
      }), /*#__PURE__*/React.createElement(SetRadialBarPayloadLegend, this.props), /*#__PURE__*/React.createElement(RadialBarImpl, _extends({}, this.props, {
        id: id
      })));
    });
  }
}
exports.RadialBar = RadialBar;
_defineProperty(RadialBar, "displayName", 'RadialBar');
_defineProperty(RadialBar, "defaultProps", defaultRadialBarProps);
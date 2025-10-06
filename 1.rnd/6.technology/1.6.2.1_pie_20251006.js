"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pie = Pie;
exports.computePieSectors = computePieSectors;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _get = _interopRequireDefault(require("es-toolkit/compat/get"));
const _clsx = require("clsx");
const _pieSelectors = require("../state/selectors/pieSelectors");
const _hooks = require("../state/hooks");
const _Layer = require("../container/Layer");
const _Curve = require("../shape/Curve");
const _Text = require("../component/Text");
const _Cell = require("../component/Cell");
const _ReactUtils = require("../util/ReactUtils");
const _Global = require("../util/Global");
const _PolarUtils = require("../util/PolarUtils");
const _DataUtils = require("../util/DataUtils");
const _ChartUtils = require("../util/ChartUtils");
const _types = require("../util/types");
const _ActiveShapeUtils = require("../util/ActiveShapeUtils");
const _tooltipContext = require("../context/tooltipContext");
const _SetTooltipEntrySettings = require("../state/SetTooltipEntrySettings");
const _tooltipSelectors = require("../state/selectors/tooltipSelectors");
const _SetLegendPayload = require("../state/SetLegendPayload");
const _Constants = require("../util/Constants");
const _useAnimationId = require("../util/useAnimationId");
const _resolveDefaultProps = require("../util/resolveDefaultProps");
const _RegisterGraphicalItemId = require("../context/RegisterGraphicalItemId");
const _SetGraphicalItem = require("../state/SetGraphicalItem");
const _svgPropertiesNoEvents = require("../util/svgPropertiesNoEvents");
const _JavascriptAnimate = require("../animation/JavascriptAnimate");
const _LabelList = require("../component/LabelList");
const _excluded = ["onMouseEnter", "onClick", "onMouseLeave"],
  _excluded2 = ["id"],
  _excluded3 = ["id"];
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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
 * The `label` prop in Pie accepts a variety of alternatives.
 */

/**
 * Internal props, combination of external props + defaultProps + private Recharts state
 */

function SetPiePayloadLegend(props) {
  const cells = (0, _react.useMemo)(() => (0, _ReactUtils.findAllByType)(props.children, _Cell.Cell), [props.children]);
  const legendPayload = (0, _hooks.useAppSelector)(state => (0, _pieSelectors.selectPieLegend)(state, props.id, cells));
  if (legendPayload == null) {
    return null;
  }
  return /*#__PURE__*/React.createElement(_SetLegendPayload.SetPolarLegendPayload, {
    legendPayload: legendPayload
  });
}
function getTooltipEntrySettings(props) {
  const {
    dataKey,
    nameKey,
    sectors,
    stroke,
    strokeWidth,
    fill,
    name,
    hide,
    tooltipType
  } = props;
  return {
    dataDefinedOnItem: sectors.map(p => p.tooltipPayload),
    positions: sectors.map(p => p.tooltipPosition),
    settings: {
      stroke,
      strokeWidth,
      fill,
      dataKey,
      nameKey,
      name: (0, _ChartUtils.getTooltipNameProp)(name, dataKey),
      hide,
      type: tooltipType,
      color: fill,
      unit: '' // why doesn't Pie support unit?
    }
  };
}
const getTextAnchor = (x, cx) => {
  if (x > cx) {
    return 'start';
  }
  if (x < cx) {
    return 'end';
  }
  return 'middle';
};
const getOuterRadius = (dataPoint, outerRadius, maxPieRadius) => {
  if (typeof outerRadius === 'function') {
    return (0, _DataUtils.getPercentValue)(outerRadius(dataPoint), maxPieRadius, maxPieRadius * 0.8);
  }
  return (0, _DataUtils.getPercentValue)(outerRadius, maxPieRadius, maxPieRadius * 0.8);
};
const parseCoordinateOfPie = (pieSettings, offset, dataPoint) => {
  const {
    top,
    left,
    width,
    height
  } = offset;
  const maxPieRadius = (0, _PolarUtils.getMaxRadius)(width, height);
  const cx = left + (0, _DataUtils.getPercentValue)(pieSettings.cx, width, width / 2);
  const cy = top + (0, _DataUtils.getPercentValue)(pieSettings.cy, height, height / 2);
  const innerRadius = (0, _DataUtils.getPercentValue)(pieSettings.innerRadius, maxPieRadius, 0);
  const outerRadius = getOuterRadius(dataPoint, pieSettings.outerRadius, maxPieRadius);
  const maxRadius = pieSettings.maxRadius || Math.sqrt(width * width + height * height) / 2;
  return {
    cx,
    cy,
    innerRadius,
    outerRadius,
    maxRadius
  };
};
const parseDeltaAngle = (startAngle, endAngle) => {
  const sign = (0, _DataUtils.mathSign)(endAngle - startAngle);
  const deltaAngle = Math.min(Math.abs(endAngle - startAngle), 360);
  return sign * deltaAngle;
};
function getClassNamePropertyIfExists(u) {
  if (u && typeof u === 'object' && 'className' in u && typeof u.className === 'string') {
    return u.className;
  }
  return '';
}
const renderLabelLineItem = (option, props) => {
  if (/*#__PURE__*/React.isValidElement(option)) {
    return /*#__PURE__*/React.cloneElement(option, props);
  }
  if (typeof option === 'function') {
    return option(props);
  }
  const className = (0, _clsx.clsx)('recharts-pie-label-line', typeof option !== 'boolean' ? option.className : '');
  return /*#__PURE__*/React.createElement(_Curve.Curve, _extends({}, props, {
    type: "linear",
    className: className
  }));
};
const renderLabelItem = (option, props, value) => {
  if (/*#__PURE__*/React.isValidElement(option)) {
    // @ts-expect-error element cloning is not typed
    return /*#__PURE__*/React.cloneElement(option, props);
  }
  let label = value;
  if (typeof option === 'function') {
    label = option(props);
    if (/*#__PURE__*/React.isValidElement(label)) {
      return label;
    }
  }
  const className = (0, _clsx.clsx)('recharts-pie-label-text', getClassNamePropertyIfExists(option));
  return /*#__PURE__*/React.createElement(_Text.Text, _extends({}, props, {
    alignmentBaseline: "middle",
    className: className
  }), label);
};
function PieLabels(_ref) {
  const {
    sectors,
    props,
    showLabels
  } = _ref;
  const {
    label,
    labelLine,
    dataKey
  } = props;
  if (!showLabels || !label || !sectors) {
    return null;
  }
  const pieProps = (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(props);
  const customLabelProps = (0, _ReactUtils.filterProps)(label, false);
  const customLabelLineProps = (0, _ReactUtils.filterProps)(labelLine, false);
  const offsetRadius = typeof label === 'object' && 'offsetRadius' in label && typeof label.offsetRadius === 'number' && label.offsetRadius || 20;
  const labels = sectors.map((entry, i) => {
    const midAngle = (entry.startAngle + entry.endAngle) / 2;
    const endPoint = (0, _PolarUtils.polarToCartesian)(entry.cx, entry.cy, entry.outerRadius + offsetRadius, midAngle);
    const labelProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, pieProps), entry), {}, {
      stroke: 'none'
    }, customLabelProps), {}, {
      index: i,
      textAnchor: getTextAnchor(endPoint.x, entry.cx)
    }, endPoint);
    const lineProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, pieProps), entry), {}, {
      fill: 'none',
      stroke: entry.fill
    }, customLabelLineProps), {}, {
      index: i,
      points: [(0, _PolarUtils.polarToCartesian)(entry.cx, entry.cy, entry.outerRadius, midAngle), endPoint],
      key: 'line'
    });
    return (
      /*#__PURE__*/
      // eslint-disable-next-line react/no-array-index-key
      React.createElement(_Layer.Layer, {
        key: "label-".concat(entry.startAngle, "-").concat(entry.endAngle, "-").concat(entry.midAngle, "-").concat(i)
      }, labelLine && renderLabelLineItem(labelLine, lineProps), renderLabelItem(label, labelProps, (0, _ChartUtils.getValueByDataKey)(entry, dataKey)))
    );
  });
  return /*#__PURE__*/React.createElement(_Layer.Layer, {
    className: "recharts-pie-labels"
  }, labels);
}
function PieLabelList(_ref2) {
  const {
    sectors,
    props,
    showLabels
  } = _ref2;
  const {
    label
  } = props;
  if (typeof label === 'object' && label != null && 'position' in label) {
    return /*#__PURE__*/React.createElement(_LabelList.LabelListFromLabelProp, {
      label: label
    });
  }
  return /*#__PURE__*/React.createElement(PieLabels, {
    sectors: sectors,
    props: props,
    showLabels: showLabels
  });
}
function PieSectors(props) {
  const {
    sectors,
    activeShape,
    inactiveShape: inactiveShapeProp,
    allOtherPieProps
  } = props;
  const activeIndex = (0, _hooks.useAppSelector)(_tooltipSelectors.selectActiveTooltipIndex);
  let {
      onMouseEnter: onMouseEnterFromProps,
      onClick: onItemClickFromProps,
      onMouseLeave: onMouseLeaveFromProps
    } = allOtherPieProps,
    restOfAllOtherProps = _objectWithoutProperties(allOtherPieProps, _excluded);
  const onMouseEnterFromContext = (0, _tooltipContext.useMouseEnterItemDispatch)(onMouseEnterFromProps, allOtherPieProps.dataKey);
  const onMouseLeaveFromContext = (0, _tooltipContext.useMouseLeaveItemDispatch)(onMouseLeaveFromProps);
  const onClickFromContext = (0, _tooltipContext.useMouseClickItemDispatch)(onItemClickFromProps, allOtherPieProps.dataKey);
  if (sectors == null || sectors.length === 0) {
    return null;
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, sectors.map((entry, i) => {
    if ((entry === null || entry === void 0 ? void 0 : entry.startAngle) === 0 && (entry === null || entry === void 0 ? void 0 : entry.endAngle) === 0 && sectors.length !== 1) return null;
    const isSectorActive = activeShape && String(i) === activeIndex;
    const inactiveShape = activeIndex ? inactiveShapeProp : null;
    const sectorOptions = isSectorActive ? activeShape : inactiveShape;
    const sectorProps = _objectSpread(_objectSpread({}, entry), {}, {
      stroke: entry.stroke,
      tabIndex: -1,
      [_Constants.DATA_ITEM_INDEX_ATTRIBUTE_NAME]: i,
      [_Constants.DATA_ITEM_DATAKEY_ATTRIBUTE_NAME]: allOtherPieProps.dataKey
    });
    return /*#__PURE__*/React.createElement(_Layer.Layer, _extends({
      tabIndex: -1,
      className: "recharts-pie-sector"
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
      key: "sector-".concat(entry === null || entry === void 0 ? void 0 : entry.startAngle, "-").concat(entry === null || entry === void 0 ? void 0 : entry.endAngle, "-").concat(entry.midAngle, "-").concat(i)
    }), /*#__PURE__*/React.createElement(_ActiveShapeUtils.Shape, _extends({
      option: sectorOptions,
      isActive: isSectorActive,
      shapeType: "sector"
    }, sectorProps)));
  }));
}
function computePieSectors(_ref3) {
  let _pieSettings$paddingA;
  const {
    pieSettings,
    displayedData,
    cells,
    offset
  } = _ref3;
  const {
    cornerRadius,
    startAngle,
    endAngle,
    dataKey,
    nameKey,
    tooltipType
  } = pieSettings;
  const minAngle = Math.abs(pieSettings.minAngle);
  const deltaAngle = parseDeltaAngle(startAngle, endAngle);
  const absDeltaAngle = Math.abs(deltaAngle);
  const paddingAngle = displayedData.length <= 1 ? 0 : (_pieSettings$paddingA = pieSettings.paddingAngle) !== null && _pieSettings$paddingA !== void 0 ? _pieSettings$paddingA : 0;
  const notZeroItemCount = displayedData.filter(entry => (0, _ChartUtils.getValueByDataKey)(entry, dataKey, 0) !== 0).length;
  const totalPaddingAngle = (absDeltaAngle >= 360 ? notZeroItemCount : notZeroItemCount - 1) * paddingAngle;
  const realTotalAngle = absDeltaAngle - notZeroItemCount * minAngle - totalPaddingAngle;
  const sum = displayedData.reduce((result, entry) => {
    const val = (0, _ChartUtils.getValueByDataKey)(entry, dataKey, 0);
    return result + ((0, _DataUtils.isNumber)(val) ? val : 0);
  }, 0);
  let sectors;
  if (sum > 0) {
    let prev;
    sectors = displayedData.map((entry, i) => {
      // @ts-expect-error getValueByDataKey does not validate the output type
      const val = (0, _ChartUtils.getValueByDataKey)(entry, dataKey, 0);
      // @ts-expect-error getValueByDataKey does not validate the output type
      const name = (0, _ChartUtils.getValueByDataKey)(entry, nameKey, i);
      const coordinate = parseCoordinateOfPie(pieSettings, offset, entry);
      const percent = ((0, _DataUtils.isNumber)(val) ? val : 0) / sum;
      let tempStartAngle;
      const entryWithCellInfo = _objectSpread(_objectSpread({}, entry), cells && cells[i] && cells[i].props);
      if (i) {
        tempStartAngle = prev.endAngle + (0, _DataUtils.mathSign)(deltaAngle) * paddingAngle * (val !== 0 ? 1 : 0);
      } else {
        tempStartAngle = startAngle;
      }
      const tempEndAngle = tempStartAngle + (0, _DataUtils.mathSign)(deltaAngle) * ((val !== 0 ? minAngle : 0) + percent * realTotalAngle);
      const midAngle = (tempStartAngle + tempEndAngle) / 2;
      const middleRadius = (coordinate.innerRadius + coordinate.outerRadius) / 2;
      const tooltipPayload = [{
        name,
        value: val,
        payload: entryWithCellInfo,
        dataKey,
        type: tooltipType
      }];
      const tooltipPosition = (0, _PolarUtils.polarToCartesian)(coordinate.cx, coordinate.cy, middleRadius, midAngle);
      prev = _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, pieSettings.presentationProps), {}, {
        percent,
        cornerRadius,
        name,
        tooltipPayload,
        midAngle,
        middleRadius,
        tooltipPosition
      }, entryWithCellInfo), coordinate), {}, {
        value: val,
        startAngle: tempStartAngle,
        endAngle: tempEndAngle,
        payload: entryWithCellInfo,
        paddingAngle: (0, _DataUtils.mathSign)(deltaAngle) * paddingAngle
      });
      return prev;
    });
  }
  return sectors;
}
function PieLabelListProvider(_ref4) {
  const {
    showLabels,
    sectors,
    children
  } = _ref4;
  const labelListEntries = (0, _react.useMemo)(() => {
    if (!showLabels || !sectors) {
      return [];
    }
    return sectors.map(entry => ({
      value: entry.value,
      payload: entry.payload,
      clockWise: false,
      parentViewBox: undefined,
      viewBox: {
        cx: entry.cx,
        cy: entry.cy,
        innerRadius: entry.innerRadius,
        outerRadius: entry.outerRadius,
        startAngle: entry.startAngle,
        endAngle: entry.endAngle,
        clockWise: false
      },
      fill: entry.fill
    }));
  }, [sectors, showLabels]);
  return /*#__PURE__*/React.createElement(_LabelList.PolarLabelListContextProvider, {
    value: showLabels ? labelListEntries : undefined
  }, children);
}
function SectorsWithAnimation(_ref5) {
  const {
    props,
    previousSectorsRef
  } = _ref5;
  const {
    sectors,
    isAnimationActive,
    animationBegin,
    animationDuration,
    animationEasing,
    activeShape,
    inactiveShape,
    onAnimationStart,
    onAnimationEnd
  } = props;
  const animationId = (0, _useAnimationId.useAnimationId)(props, 'recharts-pie-');
  const prevSectors = previousSectorsRef.current;
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
  return /*#__PURE__*/React.createElement(PieLabelListProvider, {
    showLabels: !isAnimating,
    sectors: sectors
  }, /*#__PURE__*/React.createElement(_JavascriptAnimate.JavascriptAnimate, {
    animationId: animationId,
    begin: animationBegin,
    duration: animationDuration,
    isActive: isAnimationActive,
    easing: animationEasing,
    onAnimationStart: handleAnimationStart,
    onAnimationEnd: handleAnimationEnd,
    key: animationId
  }, t => {
    const stepData = [];
    const first = sectors && sectors[0];
    let curAngle = first === null || first === void 0 ? void 0 : first.startAngle;
    sectors === null || sectors === void 0 || sectors.forEach((entry, index) => {
      const prev = prevSectors && prevSectors[index];
      const paddingAngle = index > 0 ? (0, _get.default)(entry, 'paddingAngle', 0) : 0;
      if (prev) {
        const angle = (0, _DataUtils.interpolate)(prev.endAngle - prev.startAngle, entry.endAngle - entry.startAngle, t);
        const latest = _objectSpread(_objectSpread({}, entry), {}, {
          startAngle: curAngle + paddingAngle,
          endAngle: curAngle + angle + paddingAngle
        });
        stepData.push(latest);
        curAngle = latest.endAngle;
      } else {
        const {
          endAngle,
          startAngle
        } = entry;
        const deltaAngle = (0, _DataUtils.interpolate)(0, endAngle - startAngle, t);
        const _latest = _objectSpread(_objectSpread({}, entry), {}, {
          startAngle: curAngle + paddingAngle,
          endAngle: curAngle + deltaAngle + paddingAngle
        });
        stepData.push(_latest);
        curAngle = _latest.endAngle;
      }
    });

    // eslint-disable-next-line no-param-reassign
    previousSectorsRef.current = stepData;
    return /*#__PURE__*/React.createElement(_Layer.Layer, null, /*#__PURE__*/React.createElement(PieSectors, {
      sectors: stepData,
      activeShape: activeShape,
      inactiveShape: inactiveShape,
      allOtherPieProps: props
    }));
  }), /*#__PURE__*/React.createElement(PieLabelList, {
    showLabels: !isAnimating,
    sectors: sectors,
    props: props
  }), props.children);
}
const defaultPieProps = {
  animationBegin: 400,
  animationDuration: 1500,
  animationEasing: 'ease',
  cx: '50%',
  cy: '50%',
  dataKey: 'value',
  endAngle: 360,
  fill: '#808080',
  hide: false,
  innerRadius: 0,
  isAnimationActive: !_Global.Global.isSsr,
  labelLine: true,
  legendType: 'rect',
  minAngle: 0,
  nameKey: 'name',
  outerRadius: '80%',
  paddingAngle: 0,
  rootTabIndex: 0,
  startAngle: 0,
  stroke: '#fff'
};
function PieImpl(props) {
  let {
      id
    } = props,
    propsWithoutId = _objectWithoutProperties(props, _excluded2);
  const {
    hide,
    className,
    rootTabIndex
  } = props;
  const cells = (0, _react.useMemo)(() => (0, _ReactUtils.findAllByType)(props.children, _Cell.Cell), [props.children]);
  const sectors = (0, _hooks.useAppSelector)(state => (0, _pieSelectors.selectPieSectors)(state, id, cells));
  const previousSectorsRef = (0, _react.useRef)(null);
  const layerClass = (0, _clsx.clsx)('recharts-pie', className);
  if (hide || sectors == null) {
    previousSectorsRef.current = null;
    return /*#__PURE__*/React.createElement(_Layer.Layer, {
      tabIndex: rootTabIndex,
      className: layerClass
    });
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_SetTooltipEntrySettings.SetTooltipEntrySettings, {
    fn: getTooltipEntrySettings,
    args: _objectSpread(_objectSpread({}, props), {}, {
      sectors
    })
  }), /*#__PURE__*/React.createElement(_Layer.Layer, {
    tabIndex: rootTabIndex,
    className: layerClass
  }, /*#__PURE__*/React.createElement(SectorsWithAnimation, {
    props: _objectSpread(_objectSpread({}, propsWithoutId), {}, {
      sectors
    }),
    previousSectorsRef: previousSectorsRef
  })));
}
function Pie(outsideProps) {
  const props = (0, _resolveDefaultProps.resolveDefaultProps)(outsideProps, defaultPieProps);
  let {
      id: externalId
    } = props,
    propsWithoutId = _objectWithoutProperties(props, _excluded3);
  const presentationProps = (0, _svgPropertiesNoEvents.svgPropertiesNoEvents)(propsWithoutId);
  return /*#__PURE__*/React.createElement(_RegisterGraphicalItemId.RegisterGraphicalItemId, {
    id: externalId,
    type: "pie"
  }, id => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_SetGraphicalItem.SetPolarGraphicalItem, {
    type: "pie",
    id: id,
    data: propsWithoutId.data,
    dataKey: propsWithoutId.dataKey,
    hide: propsWithoutId.hide,
    angleAxisId: 0,
    radiusAxisId: 0,
    name: propsWithoutId.name,
    nameKey: propsWithoutId.nameKey,
    tooltipType: propsWithoutId.tooltipType,
    legendType: propsWithoutId.legendType,
    fill: propsWithoutId.fill,
    cx: propsWithoutId.cx,
    cy: propsWithoutId.cy,
    startAngle: propsWithoutId.startAngle,
    endAngle: propsWithoutId.endAngle,
    paddingAngle: propsWithoutId.paddingAngle,
    minAngle: propsWithoutId.minAngle,
    innerRadius: propsWithoutId.innerRadius,
    outerRadius: propsWithoutId.outerRadius,
    cornerRadius: propsWithoutId.cornerRadius,
    presentationProps: presentationProps,
    maxRadius: props.maxRadius
  }), /*#__PURE__*/React.createElement(SetPiePayloadLegend, _extends({}, propsWithoutId, {
    id: id
  })), /*#__PURE__*/React.createElement(PieImpl, _extends({}, propsWithoutId, {
    id: id
  }))));
}
Pie.displayName = 'Pie';
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.yAxisDefaultProps = exports.YAxis = void 0;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _clsx = require("clsx");
const _CartesianAxis = require("./CartesianAxis");
const _cartesianAxisSlice = require("../state/cartesianAxisSlice");
const _hooks = require("../state/hooks");
const _axisSelectors = require("../state/selectors/axisSelectors");
const _selectChartOffsetInternal = require("../state/selectors/selectChartOffsetInternal");
const _PanoramaContext = require("../context/PanoramaContext");
const _Label = require("../component/Label");
const _ShallowEqual = require("../util/ShallowEqual");
const _resolveDefaultProps = require("../util/resolveDefaultProps");
const _excluded = ["dangerouslySetInnerHTML", "ticks"],
  _excluded2 = ["id"],
  _excluded3 = ["domain"],
  _excluded4 = ["domain"];
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function SetYAxisSettings(settings) {
  const dispatch = (0, _hooks.useAppDispatch)();
  (0, _react.useEffect)(() => {
    dispatch((0, _cartesianAxisSlice.addYAxis)(settings));
    return () => {
      dispatch((0, _cartesianAxisSlice.removeYAxis)(settings));
    };
  }, [settings, dispatch]);
  return null;
}
const YAxisImpl = props => {
  const {
    yAxisId,
    className,
    width,
    label
  } = props;
  const cartesianAxisRef = (0, _react.useRef)(null);
  const labelRef = (0, _react.useRef)(null);
  const viewBox = (0, _hooks.useAppSelector)(_selectChartOffsetInternal.selectAxisViewBox);
  const isPanorama = (0, _PanoramaContext.useIsPanorama)();
  const dispatch = (0, _hooks.useAppDispatch)();
  const axisType = 'yAxis';
  const scale = (0, _hooks.useAppSelector)(state => (0, _axisSelectors.selectAxisScale)(state, axisType, yAxisId, isPanorama));
  const axisSize = (0, _hooks.useAppSelector)(state => (0, _axisSelectors.selectYAxisSize)(state, yAxisId));
  const position = (0, _hooks.useAppSelector)(state => (0, _axisSelectors.selectYAxisPosition)(state, yAxisId));
  const cartesianTickItems = (0, _hooks.useAppSelector)(state => (0, _axisSelectors.selectTicksOfAxis)(state, axisType, yAxisId, isPanorama));
  /*
   * Here we select settings from the store and prefer to use them instead of the actual props
   * so that the chart is consistent. If we used the props directly, some components will use axis settings
   * from state and some from props and because there is a render step between these two, they might be showing different things.
   * https://github.com/recharts/recharts/issues/6257
   */
  const synchronizedSettings = (0, _hooks.useAppSelector)(state => (0, _axisSelectors.selectYAxisSettingsNoDefaults)(state, yAxisId));
  (0, _react.useLayoutEffect)(() => {
    // No dynamic width calculation is done when width !== 'auto'
    // or when a function/react element is used for label
    if (width !== 'auto' || !axisSize || (0, _Label.isLabelContentAFunction)(label) || /*#__PURE__*/(0, _react.isValidElement)(label) || synchronizedSettings == null) {
      return;
    }
    const axisComponent = cartesianAxisRef.current;
    if (!axisComponent) {
      return;
    }
    const updatedYAxisWidth = axisComponent.getCalculatedWidth();

    // if the width has changed, dispatch an action to update the width
    if (Math.round(axisSize.width) !== Math.round(updatedYAxisWidth)) {
      dispatch((0, _cartesianAxisSlice.updateYAxisWidth)({
        id: yAxisId,
        width: updatedYAxisWidth
      }));
    }
  }, [
  // The dependency on cartesianAxisRef.current is not needed because useLayoutEffect will run after every render.
  // The ref will be populated by then.
  // To re-run this effect when ticks change, we can depend on the ticks array from the store.
  cartesianTickItems, axisSize, dispatch, label, yAxisId, width, synchronizedSettings]);
  if (axisSize == null || position == null || synchronizedSettings == null) {
    return null;
  }
  let {
      dangerouslySetInnerHTML,
      ticks
    } = props,
    allOtherProps = _objectWithoutProperties(props, _excluded);
  let {
      id
    } = synchronizedSettings,
    restSynchronizedSettings = _objectWithoutProperties(synchronizedSettings, _excluded2);
  return /*#__PURE__*/React.createElement(_CartesianAxis.CartesianAxis, _extends({}, allOtherProps, restSynchronizedSettings, {
    ref: cartesianAxisRef,
    labelRef: labelRef,
    scale: scale,
    x: position.x,
    y: position.y,
    tickTextProps: width === 'auto' ? {
      width: undefined
    } : {
      width
    },
    width: axisSize.width,
    height: axisSize.height,
    className: (0, _clsx.clsx)("recharts-".concat(axisType, " ").concat(axisType), className),
    viewBox: viewBox,
    ticks: cartesianTickItems
  }));
};
const yAxisDefaultProps = exports.yAxisDefaultProps = {
  allowDataOverflow: _axisSelectors.implicitYAxis.allowDataOverflow,
  allowDecimals: _axisSelectors.implicitYAxis.allowDecimals,
  allowDuplicatedCategory: _axisSelectors.implicitYAxis.allowDuplicatedCategory,
  hide: false,
  mirror: _axisSelectors.implicitYAxis.mirror,
  orientation: _axisSelectors.implicitYAxis.orientation,
  padding: _axisSelectors.implicitYAxis.padding,
  reversed: _axisSelectors.implicitYAxis.reversed,
  scale: _axisSelectors.implicitYAxis.scale,
  tickCount: _axisSelectors.implicitYAxis.tickCount,
  type: _axisSelectors.implicitYAxis.type,
  width: _axisSelectors.implicitYAxis.width,
  yAxisId: 0
};
const YAxisSettingsDispatcher = outsideProps => {
  let _props$interval, _props$includeHidden, _props$angle, _props$minTickGap, _props$tick;
  const props = (0, _resolveDefaultProps.resolveDefaultProps)(outsideProps, yAxisDefaultProps);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SetYAxisSettings, {
    interval: (_props$interval = props.interval) !== null && _props$interval !== void 0 ? _props$interval : 'preserveEnd',
    id: props.yAxisId,
    scale: props.scale,
    type: props.type,
    domain: props.domain,
    allowDataOverflow: props.allowDataOverflow,
    dataKey: props.dataKey,
    allowDuplicatedCategory: props.allowDuplicatedCategory,
    allowDecimals: props.allowDecimals,
    tickCount: props.tickCount,
    padding: props.padding,
    includeHidden: (_props$includeHidden = props.includeHidden) !== null && _props$includeHidden !== void 0 ? _props$includeHidden : false,
    reversed: props.reversed,
    ticks: props.ticks,
    width: props.width,
    orientation: props.orientation,
    mirror: props.mirror,
    hide: props.hide,
    unit: props.unit,
    name: props.name,
    angle: (_props$angle = props.angle) !== null && _props$angle !== void 0 ? _props$angle : 0,
    minTickGap: (_props$minTickGap = props.minTickGap) !== null && _props$minTickGap !== void 0 ? _props$minTickGap : 5,
    tick: (_props$tick = props.tick) !== null && _props$tick !== void 0 ? _props$tick : true,
    tickFormatter: props.tickFormatter
  }), /*#__PURE__*/React.createElement(YAxisImpl, props));
};
const YAxisMemoComparator = (prevProps, nextProps) => {
  let {
      domain: prevDomain
    } = prevProps,
    prevRest = _objectWithoutProperties(prevProps, _excluded3);
  let {
      domain: nextDomain
    } = nextProps,
    nextRest = _objectWithoutProperties(nextProps, _excluded4);
  if (!(0, _ShallowEqual.shallowEqual)(prevRest, nextRest)) {
    return false;
  }
  if (Array.isArray(prevDomain) && prevDomain.length === 2 && Array.isArray(nextDomain) && nextDomain.length === 2) {
    return prevDomain[0] === nextDomain[0] && prevDomain[1] === nextDomain[1];
  }
  return (0, _ShallowEqual.shallowEqual)({
    domain: prevDomain
  }, {
    domain: nextDomain
  });
};
const YAxis = exports.YAxis = /*#__PURE__*/React.memo(YAxisSettingsDispatcher, YAxisMemoComparator);
YAxis.displayName = 'YAxis';
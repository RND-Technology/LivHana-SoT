"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CartesianLabelContextProvider = void 0;
exports.CartesianLabelFromLabelProp = CartesianLabelFromLabelProp;
exports.Label = Label;
exports.PolarLabelContextProvider = void 0;
exports.PolarLabelFromLabelProp = PolarLabelFromLabelProp;
exports.usePolarLabelContext = exports.isLabelContentAFunction = void 0;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _clsx = require("clsx");
const _Text = require("./Text");
const _ReactUtils = require("../util/ReactUtils");
const _DataUtils = require("../util/DataUtils");
const _PolarUtils = require("../util/PolarUtils");
const _chartLayoutContext = require("../context/chartLayoutContext");
const _hooks = require("../state/hooks");
const _polarAxisSelectors = require("../state/selectors/polarAxisSelectors");
const _resolveDefaultProps = require("../util/resolveDefaultProps");
const _excluded = ["labelRef"];
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CartesianLabelContext = /*#__PURE__*/(0, _react.createContext)(null);
const CartesianLabelContextProvider = _ref => {
  const {
    x,
    y,
    width,
    height,
    children
  } = _ref;
  const viewBox = (0, _react.useMemo)(() => ({
    x,
    y,
    width,
    height
  }), [x, y, width, height]);
  return /*#__PURE__*/React.createElement(CartesianLabelContext.Provider, {
    value: viewBox
  }, children);
};
exports.CartesianLabelContextProvider = CartesianLabelContextProvider;
const useCartesianLabelContext = () => {
  const labelChildContext = (0, _react.useContext)(CartesianLabelContext);
  const chartContext = (0, _chartLayoutContext.useViewBox)();
  return labelChildContext || chartContext;
};
const PolarLabelContext = /*#__PURE__*/(0, _react.createContext)(null);
const PolarLabelContextProvider = _ref2 => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    clockWise,
    children
  } = _ref2;
  const viewBox = (0, _react.useMemo)(() => ({
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    clockWise
  }), [cx, cy, innerRadius, outerRadius, startAngle, endAngle, clockWise]);
  return /*#__PURE__*/React.createElement(PolarLabelContext.Provider, {
    value: viewBox
  }, children);
};
exports.PolarLabelContextProvider = PolarLabelContextProvider;
const usePolarLabelContext = () => {
  const labelChildContext = (0, _react.useContext)(PolarLabelContext);
  const chartContext = (0, _hooks.useAppSelector)(_polarAxisSelectors.selectPolarViewBox);
  return labelChildContext || chartContext;
};
exports.usePolarLabelContext = usePolarLabelContext;
const getLabel = props => {
  const {
    value,
    formatter
  } = props;
  const label = (0, _DataUtils.isNullish)(props.children) ? value : props.children;
  if (typeof formatter === 'function') {
    return formatter(label);
  }
  return label;
};
const isLabelContentAFunction = content => {
  return content != null && typeof content === 'function';
};
exports.isLabelContentAFunction = isLabelContentAFunction;
const getDeltaAngle = (startAngle, endAngle) => {
  const sign = (0, _DataUtils.mathSign)(endAngle - startAngle);
  const deltaAngle = Math.min(Math.abs(endAngle - startAngle), 360);
  return sign * deltaAngle;
};
const renderRadialLabel = (labelProps, position, label, attrs, viewBox) => {
  const {
    offset,
    className
  } = labelProps;
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    clockWise
  } = viewBox;
  const radius = (innerRadius + outerRadius) / 2;
  const deltaAngle = getDeltaAngle(startAngle, endAngle);
  const sign = deltaAngle >= 0 ? 1 : -1;
  let labelAngle, direction;
  switch (position) {
    case 'insideStart':
      labelAngle = startAngle + sign * offset;
      direction = clockWise;
      break;
    case 'insideEnd':
      labelAngle = endAngle - sign * offset;
      direction = !clockWise;
      break;
    case 'end':
      labelAngle = endAngle + sign * offset;
      direction = clockWise;
      break;
    default:
      throw new Error("Unsupported position ".concat(position));
  }
  direction = deltaAngle <= 0 ? direction : !direction;
  const startPoint = (0, _PolarUtils.polarToCartesian)(cx, cy, radius, labelAngle);
  const endPoint = (0, _PolarUtils.polarToCartesian)(cx, cy, radius, labelAngle + (direction ? 1 : -1) * 359);
  const path = "M".concat(startPoint.x, ",").concat(startPoint.y, "\n    A").concat(radius, ",").concat(radius, ",0,1,").concat(direction ? 0 : 1, ",\n    ").concat(endPoint.x, ",").concat(endPoint.y);
  const id = (0, _DataUtils.isNullish)(labelProps.id) ? (0, _DataUtils.uniqueId)('recharts-radial-line-') : labelProps.id;
  return /*#__PURE__*/React.createElement("text", _extends({}, attrs, {
    dominantBaseline: "central",
    className: (0, _clsx.clsx)('recharts-radial-bar-label', className)
  }), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("path", {
    id: id,
    d: path
  })), /*#__PURE__*/React.createElement("textPath", {
    xlinkHref: "#".concat(id)
  }, label));
};
const getAttrsOfPolarLabel = (viewBox, offset, position) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle
  } = viewBox;
  const midAngle = (startAngle + endAngle) / 2;
  if (position === 'outside') {
    const {
      x: _x,
      y: _y
    } = (0, _PolarUtils.polarToCartesian)(cx, cy, outerRadius + offset, midAngle);
    return {
      x: _x,
      y: _y,
      textAnchor: _x >= cx ? 'start' : 'end',
      verticalAnchor: 'middle'
    };
  }
  if (position === 'center') {
    return {
      x: cx,
      y: cy,
      textAnchor: 'middle',
      verticalAnchor: 'middle'
    };
  }
  if (position === 'centerTop') {
    return {
      x: cx,
      y: cy,
      textAnchor: 'middle',
      verticalAnchor: 'start'
    };
  }
  if (position === 'centerBottom') {
    return {
      x: cx,
      y: cy,
      textAnchor: 'middle',
      verticalAnchor: 'end'
    };
  }
  const r = (innerRadius + outerRadius) / 2;
  const {
    x,
    y
  } = (0, _PolarUtils.polarToCartesian)(cx, cy, r, midAngle);
  return {
    x,
    y,
    textAnchor: 'middle',
    verticalAnchor: 'middle'
  };
};
const isPolar = viewBox => 'cx' in viewBox && (0, _DataUtils.isNumber)(viewBox.cx);
const getAttrsOfCartesianLabel = (props, viewBox) => {
  const {
    parentViewBox: parentViewBoxFromProps,
    offset,
    position
  } = props;
  let parentViewBox;
  if (parentViewBoxFromProps != null && !isPolar(parentViewBoxFromProps)) {
    // Check that nobody is trying to pass a polar viewBox to a cartesian label
    parentViewBox = parentViewBoxFromProps;
  }
  const {
    x,
    y,
    width,
    height
  } = viewBox;

  // Define vertical offsets and position inverts based on the value being positive or negative
  const verticalSign = height >= 0 ? 1 : -1;
  const verticalOffset = verticalSign * offset;
  const verticalEnd = verticalSign > 0 ? 'end' : 'start';
  const verticalStart = verticalSign > 0 ? 'start' : 'end';

  // Define horizontal offsets and position inverts based on the value being positive or negative
  const horizontalSign = width >= 0 ? 1 : -1;
  const horizontalOffset = horizontalSign * offset;
  const horizontalEnd = horizontalSign > 0 ? 'end' : 'start';
  const horizontalStart = horizontalSign > 0 ? 'start' : 'end';
  if (position === 'top') {
    const attrs = {
      x: x + width / 2,
      y: y - verticalSign * offset,
      textAnchor: 'middle',
      verticalAnchor: verticalEnd
    };
    return _objectSpread(_objectSpread({}, attrs), parentViewBox ? {
      height: Math.max(y - parentViewBox.y, 0),
      width
    } : {});
  }
  if (position === 'bottom') {
    const _attrs = {
      x: x + width / 2,
      y: y + height + verticalOffset,
      textAnchor: 'middle',
      verticalAnchor: verticalStart
    };
    return _objectSpread(_objectSpread({}, _attrs), parentViewBox ? {
      height: Math.max(parentViewBox.y + parentViewBox.height - (y + height), 0),
      width
    } : {});
  }
  if (position === 'left') {
    const _attrs2 = {
      x: x - horizontalOffset,
      y: y + height / 2,
      textAnchor: horizontalEnd,
      verticalAnchor: 'middle'
    };
    return _objectSpread(_objectSpread({}, _attrs2), parentViewBox ? {
      width: Math.max(_attrs2.x - parentViewBox.x, 0),
      height
    } : {});
  }
  if (position === 'right') {
    const _attrs3 = {
      x: x + width + horizontalOffset,
      y: y + height / 2,
      textAnchor: horizontalStart,
      verticalAnchor: 'middle'
    };
    return _objectSpread(_objectSpread({}, _attrs3), parentViewBox ? {
      width: Math.max(parentViewBox.x + parentViewBox.width - _attrs3.x, 0),
      height
    } : {});
  }
  const sizeAttrs = parentViewBox ? {
    width,
    height
  } : {};
  if (position === 'insideLeft') {
    return _objectSpread({
      x: x + horizontalOffset,
      y: y + height / 2,
      textAnchor: horizontalStart,
      verticalAnchor: 'middle'
    }, sizeAttrs);
  }
  if (position === 'insideRight') {
    return _objectSpread({
      x: x + width - horizontalOffset,
      y: y + height / 2,
      textAnchor: horizontalEnd,
      verticalAnchor: 'middle'
    }, sizeAttrs);
  }
  if (position === 'insideTop') {
    return _objectSpread({
      x: x + width / 2,
      y: y + verticalOffset,
      textAnchor: 'middle',
      verticalAnchor: verticalStart
    }, sizeAttrs);
  }
  if (position === 'insideBottom') {
    return _objectSpread({
      x: x + width / 2,
      y: y + height - verticalOffset,
      textAnchor: 'middle',
      verticalAnchor: verticalEnd
    }, sizeAttrs);
  }
  if (position === 'insideTopLeft') {
    return _objectSpread({
      x: x + horizontalOffset,
      y: y + verticalOffset,
      textAnchor: horizontalStart,
      verticalAnchor: verticalStart
    }, sizeAttrs);
  }
  if (position === 'insideTopRight') {
    return _objectSpread({
      x: x + width - horizontalOffset,
      y: y + verticalOffset,
      textAnchor: horizontalEnd,
      verticalAnchor: verticalStart
    }, sizeAttrs);
  }
  if (position === 'insideBottomLeft') {
    return _objectSpread({
      x: x + horizontalOffset,
      y: y + height - verticalOffset,
      textAnchor: horizontalStart,
      verticalAnchor: verticalEnd
    }, sizeAttrs);
  }
  if (position === 'insideBottomRight') {
    return _objectSpread({
      x: x + width - horizontalOffset,
      y: y + height - verticalOffset,
      textAnchor: horizontalEnd,
      verticalAnchor: verticalEnd
    }, sizeAttrs);
  }
  if (!!position && typeof position === 'object' && ((0, _DataUtils.isNumber)(position.x) || (0, _DataUtils.isPercent)(position.x)) && ((0, _DataUtils.isNumber)(position.y) || (0, _DataUtils.isPercent)(position.y))) {
    return _objectSpread({
      x: x + (0, _DataUtils.getPercentValue)(position.x, width),
      y: y + (0, _DataUtils.getPercentValue)(position.y, height),
      textAnchor: 'end',
      verticalAnchor: 'end'
    }, sizeAttrs);
  }
  return _objectSpread({
    x: x + width / 2,
    y: y + height / 2,
    textAnchor: 'middle',
    verticalAnchor: 'middle'
  }, sizeAttrs);
};
const defaultLabelProps = {
  offset: 5
};
function Label(outerProps) {
  const props = (0, _resolveDefaultProps.resolveDefaultProps)(outerProps, defaultLabelProps);
  const {
    viewBox: viewBoxFromProps,
    position,
    value,
    children,
    content,
    className = '',
    textBreakAll,
    labelRef
  } = props;
  const polarViewBox = usePolarLabelContext();
  const cartesianViewBox = useCartesianLabelContext();

  /*
   * I am not proud about this solution but it's a quick fix for https://github.com/recharts/recharts/issues/6030#issuecomment-3155352460.
   * What we should really do is split Label into two components: CartesianLabel and PolarLabel and then handle their respective viewBoxes separately.
   * Also other components should set its own viewBox in a context so that we can fix https://github.com/recharts/recharts/issues/6156
   */
  const resolvedViewBox = position === 'center' ? cartesianViewBox : polarViewBox !== null && polarViewBox !== void 0 ? polarViewBox : cartesianViewBox;
  const viewBox = viewBoxFromProps || resolvedViewBox;
  if (!viewBox || (0, _DataUtils.isNullish)(value) && (0, _DataUtils.isNullish)(children) && ! /*#__PURE__*/(0, _react.isValidElement)(content) && typeof content !== 'function') {
    return null;
  }
  const propsWithViewBox = _objectSpread(_objectSpread({}, props), {}, {
    viewBox
  });
  if (/*#__PURE__*/(0, _react.isValidElement)(content)) {
    let {
        labelRef: _
      } = propsWithViewBox,
      propsWithoutLabelRef = _objectWithoutProperties(propsWithViewBox, _excluded);
    return /*#__PURE__*/(0, _react.cloneElement)(content, propsWithoutLabelRef);
  }
  let label;
  if (typeof content === 'function') {
    label = /*#__PURE__*/(0, _react.createElement)(content, propsWithViewBox);
    if (/*#__PURE__*/(0, _react.isValidElement)(label)) {
      return label;
    }
  } else {
    label = getLabel(props);
  }
  const isPolarLabel = isPolar(viewBox);
  const attrs = (0, _ReactUtils.filterProps)(props, true);
  if (isPolarLabel && (position === 'insideStart' || position === 'insideEnd' || position === 'end')) {
    return renderRadialLabel(props, position, label, attrs, viewBox);
  }
  const positionAttrs = isPolarLabel ? getAttrsOfPolarLabel(viewBox, props.offset, props.position) : getAttrsOfCartesianLabel(props, viewBox);
  return /*#__PURE__*/React.createElement(_Text.Text, _extends({
    ref: labelRef,
    className: (0, _clsx.clsx)('recharts-label', className)
  }, attrs, positionAttrs, {
    breakAll: textBreakAll
  }), label);
}
Label.displayName = 'Label';
const parseLabel = (label, viewBox, labelRef) => {
  if (!label) {
    return null;
  }
  const commonProps = {
    viewBox,
    labelRef
  };
  if (label === true) {
    return /*#__PURE__*/React.createElement(Label, _extends({
      key: "label-implicit"
    }, commonProps));
  }
  if ((0, _DataUtils.isNumOrStr)(label)) {
    return /*#__PURE__*/React.createElement(Label, _extends({
      key: "label-implicit",
      value: label
    }, commonProps));
  }
  if (/*#__PURE__*/(0, _react.isValidElement)(label)) {
    if (label.type === Label) {
      return /*#__PURE__*/(0, _react.cloneElement)(label, _objectSpread({
        key: 'label-implicit'
      }, commonProps));
    }
    return /*#__PURE__*/React.createElement(Label, _extends({
      key: "label-implicit",
      content: label
    }, commonProps));
  }
  if (isLabelContentAFunction(label)) {
    return /*#__PURE__*/React.createElement(Label, _extends({
      key: "label-implicit",
      content: label
    }, commonProps));
  }
  if (label && typeof label === 'object') {
    return /*#__PURE__*/React.createElement(Label, _extends({}, label, {
      key: "label-implicit"
    }, commonProps));
  }
  return null;
};
function CartesianLabelFromLabelProp(_ref3) {
  const {
    label
  } = _ref3;
  const viewBox = useCartesianLabelContext();
  return parseLabel(label, viewBox) || null;
}
function PolarLabelFromLabelProp(_ref4) {
  const {
    label
  } = _ref4;
  const viewBox = usePolarLabelContext();
  return parseLabel(label, viewBox) || null;
}
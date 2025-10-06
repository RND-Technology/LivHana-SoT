"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Legend = void 0;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _reactDom = require("react-dom");
const _legendPortalContext = require("../context/legendPortalContext");
const _DefaultLegendContent = require("./DefaultLegendContent");
const _DataUtils = require("../util/DataUtils");
const _getUniqPayload = require("../util/payload/getUniqPayload");
const _legendPayloadContext = require("../context/legendPayloadContext");
const _useElementOffset = require("../util/useElementOffset");
const _chartLayoutContext = require("../context/chartLayoutContext");
const _legendSlice = require("../state/legendSlice");
const _hooks = require("../state/hooks");
const _excluded = ["contextPayload"];
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (let e = 1; e < arguments.length; e++) { const t = arguments[e]; for (const r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function defaultUniqBy(entry) {
  return entry.value;
}
function LegendContent(props) {
  let {
      contextPayload
    } = props,
    otherProps = _objectWithoutProperties(props, _excluded);
  const finalPayload = (0, _getUniqPayload.getUniqPayload)(contextPayload, props.payloadUniqBy, defaultUniqBy);
  const contentProps = _objectSpread(_objectSpread({}, otherProps), {}, {
    payload: finalPayload
  });
  if (/*#__PURE__*/React.isValidElement(props.content)) {
    return /*#__PURE__*/React.cloneElement(props.content, contentProps);
  }
  if (typeof props.content === 'function') {
    return /*#__PURE__*/React.createElement(props.content, contentProps);
  }
  return /*#__PURE__*/React.createElement(_DefaultLegendContent.DefaultLegendContent, contentProps);
}
function getDefaultPosition(style, props, margin, chartWidth, chartHeight, box) {
  const {
    layout,
    align,
    verticalAlign
  } = props;
  let hPos, vPos;
  if (!style || (style.left === undefined || style.left === null) && (style.right === undefined || style.right === null)) {
    if (align === 'center' && layout === 'vertical') {
      hPos = {
        left: ((chartWidth || 0) - box.width) / 2
      };
    } else {
      hPos = align === 'right' ? {
        right: margin && margin.right || 0
      } : {
        left: margin && margin.left || 0
      };
    }
  }
  if (!style || (style.top === undefined || style.top === null) && (style.bottom === undefined || style.bottom === null)) {
    if (verticalAlign === 'middle') {
      vPos = {
        top: ((chartHeight || 0) - box.height) / 2
      };
    } else {
      vPos = verticalAlign === 'bottom' ? {
        bottom: margin && margin.bottom || 0
      } : {
        top: margin && margin.top || 0
      };
    }
  }
  return _objectSpread(_objectSpread({}, hPos), vPos);
}
function LegendSettingsDispatcher(props) {
  const dispatch = (0, _hooks.useAppDispatch)();
  (0, _react.useEffect)(() => {
    dispatch((0, _legendSlice.setLegendSettings)(props));
  }, [dispatch, props]);
  return null;
}
function LegendSizeDispatcher(props) {
  const dispatch = (0, _hooks.useAppDispatch)();
  (0, _react.useEffect)(() => {
    dispatch((0, _legendSlice.setLegendSize)(props));
    return () => {
      dispatch((0, _legendSlice.setLegendSize)({
        width: 0,
        height: 0
      }));
    };
  }, [dispatch, props]);
  return null;
}
function LegendWrapper(props) {
  const contextPayload = (0, _legendPayloadContext.useLegendPayload)();
  const legendPortalFromContext = (0, _legendPortalContext.useLegendPortal)();
  const margin = (0, _chartLayoutContext.useMargin)();
  const {
    width: widthFromProps,
    height: heightFromProps,
    wrapperStyle,
    portal: portalFromProps
  } = props;
  // The contextPayload is not used directly inside the hook, but we need the onBBoxUpdate call
  // when the payload changes, therefore it's here as a dependency.
  const [lastBoundingBox, updateBoundingBox] = (0, _useElementOffset.useElementOffset)([contextPayload]);
  const chartWidth = (0, _chartLayoutContext.useChartWidth)();
  const chartHeight = (0, _chartLayoutContext.useChartHeight)();
  if (chartWidth == null || chartHeight == null) {
    return null;
  }
  const maxWidth = chartWidth - (margin.left || 0) - (margin.right || 0);
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const widthOrHeight = Legend.getWidthOrHeight(props.layout, heightFromProps, widthFromProps, maxWidth);
  // if the user supplies their own portal, only use their defined wrapper styles
  const outerStyle = portalFromProps ? wrapperStyle : _objectSpread(_objectSpread({
    position: 'absolute',
    width: (widthOrHeight === null || widthOrHeight === void 0 ? void 0 : widthOrHeight.width) || widthFromProps || 'auto',
    height: (widthOrHeight === null || widthOrHeight === void 0 ? void 0 : widthOrHeight.height) || heightFromProps || 'auto'
  }, getDefaultPosition(wrapperStyle, props, margin, chartWidth, chartHeight, lastBoundingBox)), wrapperStyle);
  const legendPortal = portalFromProps !== null && portalFromProps !== void 0 ? portalFromProps : legendPortalFromContext;
  if (legendPortal == null) {
    return null;
  }
  const legendElement = /*#__PURE__*/React.createElement("div", {
    className: "recharts-legend-wrapper",
    style: outerStyle,
    ref: updateBoundingBox
  }, /*#__PURE__*/React.createElement(LegendSettingsDispatcher, {
    layout: props.layout,
    align: props.align,
    verticalAlign: props.verticalAlign,
    itemSorter: props.itemSorter
  }), /*#__PURE__*/React.createElement(LegendSizeDispatcher, {
    width: lastBoundingBox.width,
    height: lastBoundingBox.height
  }), /*#__PURE__*/React.createElement(LegendContent, _extends({}, props, widthOrHeight, {
    margin: margin,
    chartWidth: chartWidth,
    chartHeight: chartHeight,
    contextPayload: contextPayload
  })));
  return /*#__PURE__*/(0, _reactDom.createPortal)(legendElement, legendPortal);
}
class Legend extends _react.PureComponent {
  static getWidthOrHeight(layout, height, width, maxWidth) {
    if (layout === 'vertical' && (0, _DataUtils.isNumber)(height)) {
      return {
        height
      };
    }
    if (layout === 'horizontal') {
      return {
        width: width || maxWidth
      };
    }
    return null;
  }
  render() {
    return /*#__PURE__*/React.createElement(LegendWrapper, this.props);
  }
}
exports.Legend = Legend;
_defineProperty(Legend, "displayName", 'Legend');
_defineProperty(Legend, "defaultProps", {
  align: 'center',
  iconSize: 14,
  itemSorter: 'value',
  layout: 'horizontal',
  verticalAlign: 'bottom'
});
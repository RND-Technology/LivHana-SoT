"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RechartsWrapper = void 0;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _clsx = require("clsx");
const _tooltipSlice = require("../state/tooltipSlice");
const _hooks = require("../state/hooks");
const _mouseEventsMiddleware = require("../state/mouseEventsMiddleware");
const _useChartSynchronisation = require("../synchronisation/useChartSynchronisation");
const _keyboardEventsMiddleware = require("../state/keyboardEventsMiddleware");
const _useReportScale = require("../util/useReportScale");
const _externalEventsMiddleware = require("../state/externalEventsMiddleware");
const _touchEventsMiddleware = require("../state/touchEventsMiddleware");
const _tooltipPortalContext = require("../context/tooltipPortalContext");
const _legendPortalContext = require("../context/legendPortalContext");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const RechartsWrapper = exports.RechartsWrapper = /*#__PURE__*/(0, _react.forwardRef)((_ref, ref) => {
  const {
    children,
    className,
    height,
    onClick,
    onContextMenu,
    onDoubleClick,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    onMouseUp,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
    style,
    width
  } = _ref;
  const dispatch = (0, _hooks.useAppDispatch)();
  const [tooltipPortal, setTooltipPortal] = (0, _react.useState)(null);
  const [legendPortal, setLegendPortal] = (0, _react.useState)(null);
  (0, _useChartSynchronisation.useSynchronisedEventsFromOtherCharts)();
  const setScaleRef = (0, _useReportScale.useReportScale)();
  const innerRef = (0, _react.useCallback)(node => {
    setScaleRef(node);
    if (typeof ref === 'function') {
      ref(node);
    }
    setTooltipPortal(node);
    setLegendPortal(node);
  }, [setScaleRef, ref, setTooltipPortal, setLegendPortal]);
  const myOnClick = (0, _react.useCallback)(e => {
    dispatch((0, _mouseEventsMiddleware.mouseClickAction)(e));
    dispatch((0, _externalEventsMiddleware.externalEventAction)({
      handler: onClick,
      reactEvent: e
    }));
  }, [dispatch, onClick]);
  const myOnMouseEnter = (0, _react.useCallback)(e => {
    dispatch((0, _mouseEventsMiddleware.mouseMoveAction)(e));
    dispatch((0, _externalEventsMiddleware.externalEventAction)({
      handler: onMouseEnter,
      reactEvent: e
    }));
  }, [dispatch, onMouseEnter]);
  const myOnMouseLeave = (0, _react.useCallback)(e => {
    dispatch((0, _tooltipSlice.mouseLeaveChart)());
    dispatch((0, _externalEventsMiddleware.externalEventAction)({
      handler: onMouseLeave,
      reactEvent: e
    }));
  }, [dispatch, onMouseLeave]);
  const myOnMouseMove = (0, _react.useCallback)(e => {
    dispatch((0, _mouseEventsMiddleware.mouseMoveAction)(e));
    dispatch((0, _externalEventsMiddleware.externalEventAction)({
      handler: onMouseMove,
      reactEvent: e
    }));
  }, [dispatch, onMouseMove]);
  const onFocus = (0, _react.useCallback)(() => {
    dispatch((0, _keyboardEventsMiddleware.focusAction)());
  }, [dispatch]);
  const onKeyDown = (0, _react.useCallback)(e => {
    dispatch((0, _keyboardEventsMiddleware.keyDownAction)(e.key));
  }, [dispatch]);
  const myOnContextMenu = (0, _react.useCallback)(e => {
    dispatch((0, _externalEventsMiddleware.externalEventAction)({
      handler: onContextMenu,
      reactEvent: e
    }));
  }, [dispatch, onContextMenu]);
  const myOnDoubleClick = (0, _react.useCallback)(e => {
    dispatch((0, _externalEventsMiddleware.externalEventAction)({
      handler: onDoubleClick,
      reactEvent: e
    }));
  }, [dispatch, onDoubleClick]);
  const myOnMouseDown = (0, _react.useCallback)(e => {
    dispatch((0, _externalEventsMiddleware.externalEventAction)({
      handler: onMouseDown,
      reactEvent: e
    }));
  }, [dispatch, onMouseDown]);
  const myOnMouseUp = (0, _react.useCallback)(e => {
    dispatch((0, _externalEventsMiddleware.externalEventAction)({
      handler: onMouseUp,
      reactEvent: e
    }));
  }, [dispatch, onMouseUp]);
  const myOnTouchStart = (0, _react.useCallback)(e => {
    dispatch((0, _externalEventsMiddleware.externalEventAction)({
      handler: onTouchStart,
      reactEvent: e
    }));
  }, [dispatch, onTouchStart]);

  /*
   * onTouchMove is special because it behaves different from mouse events.
   * Mouse events have enter + leave combo that notify us when the mouse is over
   * a certain element. Touch events don't have that; touch only gives us
   * start (finger down), end (finger up) and move (finger moving).
   * So we need to figure out which element the user is touching
   * ourselves. Fortunately, there's a convenient method for that:
   * https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint
   */
  const myOnTouchMove = (0, _react.useCallback)(e => {
    dispatch((0, _touchEventsMiddleware.touchEventAction)(e));
    dispatch((0, _externalEventsMiddleware.externalEventAction)({
      handler: onTouchMove,
      reactEvent: e
    }));
  }, [dispatch, onTouchMove]);
  const myOnTouchEnd = (0, _react.useCallback)(e => {
    dispatch((0, _externalEventsMiddleware.externalEventAction)({
      handler: onTouchEnd,
      reactEvent: e
    }));
  }, [dispatch, onTouchEnd]);
  return /*#__PURE__*/React.createElement(_tooltipPortalContext.TooltipPortalContext.Provider, {
    value: tooltipPortal
  }, /*#__PURE__*/React.createElement(_legendPortalContext.LegendPortalContext.Provider, {
    value: legendPortal
  }, /*#__PURE__*/React.createElement("div", {
    className: (0, _clsx.clsx)('recharts-wrapper', className),
    style: _objectSpread({
      position: 'relative',
      cursor: 'default',
      width,
      height
    }, style),
    onClick: myOnClick,
    onContextMenu: myOnContextMenu,
    onDoubleClick: myOnDoubleClick,
    onFocus: onFocus,
    onKeyDown: onKeyDown,
    onMouseDown: myOnMouseDown,
    onMouseEnter: myOnMouseEnter,
    onMouseLeave: myOnMouseLeave,
    onMouseMove: myOnMouseMove,
    onMouseUp: myOnMouseUp,
    onTouchEnd: myOnTouchEnd,
    onTouchMove: myOnTouchMove,
    onTouchStart: myOnTouchStart,
    ref: innerRef
  }, children)));
});
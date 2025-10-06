"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Customized = Customized;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _Layer = require("../container/Layer");
const _LogUtils = require("../util/LogUtils");
const _excluded = ["component"];
/**
 * @fileOverview Customized
 */
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
/**
 * custom svg elements by rechart instance props and state.
 * @returns {Object}   svg elements
 */
function Customized(_ref) {
  let {
      component
    } = _ref,
    props = _objectWithoutProperties(_ref, _excluded);
  let child;
  if (/*#__PURE__*/(0, _react.isValidElement)(component)) {
    child = /*#__PURE__*/(0, _react.cloneElement)(component, props);
  } else if (typeof component === 'function') {
    child = /*#__PURE__*/(0, _react.createElement)(component, props);
  } else {
    (0, _LogUtils.warn)(false, "Customized's props `component` must be React.element or Function, but got %s.", typeof component);
  }
  return /*#__PURE__*/React.createElement(_Layer.Layer, {
    className: "recharts-customized-wrapper"
  }, child);
}
Customized.displayName = 'Customized';
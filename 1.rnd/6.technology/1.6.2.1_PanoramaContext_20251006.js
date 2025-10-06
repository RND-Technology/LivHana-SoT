"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useIsPanorama = exports.PanoramaContextProvider = void 0;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
const PanoramaContext = /*#__PURE__*/(0, _react.createContext)(null);
const useIsPanorama = () => (0, _react.useContext)(PanoramaContext) != null;
exports.useIsPanorama = useIsPanorama;
const PanoramaContextProvider = _ref => {
  const {
    children
  } = _ref;
  return /*#__PURE__*/React.createElement(PanoramaContext.Provider, {
    value: true
  }, children);
};
exports.PanoramaContextProvider = PanoramaContextProvider;
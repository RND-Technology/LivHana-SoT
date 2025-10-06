"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RegisterGraphicalItemId = void 0;
exports.useGraphicalItemId = useGraphicalItemId;
const _react = _interopRequireWildcard(require("react"));
const React = _react;
const _useUniqueId = require("../util/useUniqueId");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
const GraphicalItemIdContext = /*#__PURE__*/(0, _react.createContext)(undefined);
const RegisterGraphicalItemId = _ref => {
  const {
    id,
    type,
    children
  } = _ref;
  const resolvedId = (0, _useUniqueId.useUniqueId)("recharts-".concat(type), id);
  return /*#__PURE__*/React.createElement(GraphicalItemIdContext.Provider, {
    value: resolvedId
  }, children(resolvedId));
};
exports.RegisterGraphicalItemId = RegisterGraphicalItemId;
function useGraphicalItemId() {
  return (0, _react.useContext)(GraphicalItemIdContext);
}
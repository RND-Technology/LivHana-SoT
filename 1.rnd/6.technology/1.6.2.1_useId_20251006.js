"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useIdFallback = exports.useId = void 0;
const React = _interopRequireWildcard(require("react"));
const _DataUtils = require("./DataUtils");
let _ref;
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
/**
 * Fallback for React.useId() for versions prior to React 18.
 * Generates a unique ID using a simple counter and a prefix.
 *
 * @returns A unique ID that remains consistent across renders.
 */
const useIdFallback = () => {
  const [id] = React.useState(() => (0, _DataUtils.uniqueId)('uid-'));
  return id;
};

/*
 * This weird syntax is used to avoid a build-time error in React 17 and earlier when building with Webpack.
 * See https://github.com/webpack/webpack/issues/14814
 */
exports.useIdFallback = useIdFallback;
const useId = exports.useId = (_ref = React['useId'.toString()]) !== null && _ref !== void 0 ? _ref : useIdFallback;
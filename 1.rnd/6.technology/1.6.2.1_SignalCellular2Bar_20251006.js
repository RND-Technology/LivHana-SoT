"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const React = _interopRequireWildcard(require("react"));
const _createSvgIcon = _interopRequireDefault(require("./utils/createSvgIcon"));
const _jsxRuntime = require("react/jsx-runtime");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; const r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; const t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); const n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (const u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { const i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const _default = exports.default = (0, _createSvgIcon.default)( /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
  children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("path", {
    fillOpacity: ".3",
    d: "M2 22h20V2z"
  }), /*#__PURE__*/(0, _jsxRuntime.jsx)("path", {
    d: "M14 10L2 22h12z"
  })]
}), 'SignalCellular2Bar');
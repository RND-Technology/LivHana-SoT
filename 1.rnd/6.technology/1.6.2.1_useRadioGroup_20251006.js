"use strict";
'use client';

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useRadioGroup;
const React = _interopRequireWildcard(require("react"));
const _RadioGroupContext = _interopRequireDefault(require("./RadioGroupContext"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; const r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; const t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); const n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (const u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { const i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function useRadioGroup() {
  return React.useContext(_RadioGroupContext.default);
}
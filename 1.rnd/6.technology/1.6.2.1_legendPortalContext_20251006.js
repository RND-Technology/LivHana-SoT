"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useLegendPortal = exports.LegendPortalContext = void 0;
const _react = require("react");
const LegendPortalContext = exports.LegendPortalContext = /*#__PURE__*/(0, _react.createContext)(null);
const useLegendPortal = () => (0, _react.useContext)(LegendPortalContext);
exports.useLegendPortal = useLegendPortal;
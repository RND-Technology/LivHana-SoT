"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTooltipPortal = exports.TooltipPortalContext = void 0;
const _react = require("react");
const TooltipPortalContext = exports.TooltipPortalContext = /*#__PURE__*/(0, _react.createContext)(null);
const useTooltipPortal = () => (0, _react.useContext)(TooltipPortalContext);
exports.useTooltipPortal = useTooltipPortal;
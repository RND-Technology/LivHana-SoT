"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useAccessibilityLayer = void 0;
const _hooks = require("../state/hooks");
const useAccessibilityLayer = () => (0, _hooks.useAppSelector)(state => state.rootProps.accessibilityLayer);
exports.useAccessibilityLayer = useAccessibilityLayer;
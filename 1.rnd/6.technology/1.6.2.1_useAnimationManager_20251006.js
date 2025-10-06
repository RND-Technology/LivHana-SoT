"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnimationManagerContext = void 0;
exports.useAnimationManager = useAnimationManager;
const _react = require("react");
const _createDefaultAnimationManager = require("./createDefaultAnimationManager");
const AnimationManagerContext = exports.AnimationManagerContext = /*#__PURE__*/(0, _react.createContext)(_createDefaultAnimationManager.createDefaultAnimationManager);
function useAnimationManager(animationId, animationManagerFromProps) {
  const contextAnimationManager = (0, _react.useContext)(AnimationManagerContext);
  return (0, _react.useMemo)(() => animationManagerFromProps !== null && animationManagerFromProps !== void 0 ? animationManagerFromProps : contextAnimationManager(animationId), [animationId, animationManagerFromProps, contextAnimationManager]);
}
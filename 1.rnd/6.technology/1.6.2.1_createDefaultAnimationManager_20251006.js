"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDefaultAnimationManager = createDefaultAnimationManager;
const _AnimationManager = require("./AnimationManager");
const _timeoutController = require("./timeoutController");
function createDefaultAnimationManager() {
  return (0, _AnimationManager.createAnimateManager)(new _timeoutController.RequestAnimationFrameTimeoutController());
}
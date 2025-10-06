"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectPolarGridRadii = exports.selectPolarGridAngles = void 0;
const _reselect = require("reselect");
const _polarScaleSelectors = require("./polarScaleSelectors");
const selectAngleAxisTicks = (state, anglexisId) => (0, _polarScaleSelectors.selectPolarAxisTicks)(state, 'angleAxis', anglexisId, false);
const selectPolarGridAngles = exports.selectPolarGridAngles = (0, _reselect.createSelector)([selectAngleAxisTicks], ticks => {
  if (!ticks) {
    return undefined;
  }
  return ticks.map(tick => tick.coordinate);
});
const selectRadiusAxisTicks = (state, radiusAxisId) => (0, _polarScaleSelectors.selectPolarAxisTicks)(state, 'radiusAxis', radiusAxisId, false);
const selectPolarGridRadii = exports.selectPolarGridRadii = (0, _reselect.createSelector)([selectRadiusAxisTicks], ticks => {
  if (!ticks) {
    return undefined;
  }
  return ticks.map(tick => tick.coordinate);
});
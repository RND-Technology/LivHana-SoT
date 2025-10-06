"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectAllYAxes = exports.selectAllXAxes = void 0;
const _reselect = require("reselect");
const selectAllXAxes = exports.selectAllXAxes = (0, _reselect.createSelector)(state => state.cartesianAxis.xAxis, xAxisMap => {
  return Object.values(xAxisMap);
});
const selectAllYAxes = exports.selectAllYAxes = (0, _reselect.createSelector)(state => state.cartesianAxis.yAxis, yAxisMap => {
  return Object.values(yAxisMap);
});
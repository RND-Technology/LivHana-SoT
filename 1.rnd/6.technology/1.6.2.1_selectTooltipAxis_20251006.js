"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectTooltipAxisDataKey = exports.selectTooltipAxis = void 0;
const _reselect = require("reselect");
const _axisSelectors = require("./axisSelectors");
const _selectTooltipAxisType = require("./selectTooltipAxisType");
const _selectTooltipAxisId = require("./selectTooltipAxisId");
const selectTooltipAxis = state => {
  const axisType = (0, _selectTooltipAxisType.selectTooltipAxisType)(state);
  const axisId = (0, _selectTooltipAxisId.selectTooltipAxisId)(state);
  return (0, _axisSelectors.selectAxisSettings)(state, axisType, axisId);
};
exports.selectTooltipAxis = selectTooltipAxis;
const selectTooltipAxisDataKey = exports.selectTooltipAxisDataKey = (0, _reselect.createSelector)([selectTooltipAxis], axis => axis === null || axis === void 0 ? void 0 : axis.dataKey);
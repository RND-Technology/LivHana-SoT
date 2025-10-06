"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.combineActiveTooltipIndex = void 0;
const _isWellBehavedNumber = require("../../../util/isWellBehavedNumber");
const combineActiveTooltipIndex = (tooltipInteraction, chartData) => {
  const desiredIndex = tooltipInteraction === null || tooltipInteraction === void 0 ? void 0 : tooltipInteraction.index;
  if (desiredIndex == null) {
    return null;
  }
  const indexAsNumber = Number(desiredIndex);
  if (!(0, _isWellBehavedNumber.isWellBehavedNumber)(indexAsNumber)) {
    // this is for charts like Sankey and Treemap that do not support numerical indexes. We need a proper solution for this before we can start supporting keyboard events on these charts.
    return desiredIndex;
  }

  /*
   * Zero is a trivial limit for single-dimensional charts like Line and Area,
   * but this also needs a support for multidimensional charts like Sankey and Treemap! TODO
   */
  const lowerLimit = 0;
  let upperLimit = +Infinity;
  if (chartData.length > 0) {
    upperLimit = chartData.length - 1;
  }

  // now let's clamp the desiredIndex between the limits
  return String(Math.max(lowerLimit, Math.min(indexAsNumber, upperLimit)));
};
exports.combineActiveTooltipIndex = combineActiveTooltipIndex;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCalculatedYAxisWidth = void 0;
/**
 * Calculates the width of the Y-axis based on the tick labels and the axis label.
 * @param {Object} params - The parameters object.
 * @param {React.RefObject<any>} params.cartesianAxisRef - The ref to the CartesianAxis component.
 * @param {React.RefObject<Element>} params.labelRef - The ref to the label element.
 * @param {number} [params.labelGapWithTick=5] - The gap between the label and the tick.
 * @returns {number} The calculated width of the Y-axis.
 */
const getCalculatedYAxisWidth = _ref => {
  const {
    ticks,
    label,
    labelGapWithTick = 5,
    // Default gap between label and tick
    tickSize = 0,
    tickMargin = 0
  } = _ref;
  // find the max width of the tick labels
  let maxTickWidth = 0;
  if (ticks) {
    ticks.forEach(tickNode => {
      if (tickNode) {
        const bbox = tickNode.getBoundingClientRect();
        if (bbox.width > maxTickWidth) {
          maxTickWidth = bbox.width;
        }
      }
    });

    // calculate width of the axis label
    const labelWidth = label ? label.getBoundingClientRect().width : 0;
    const tickWidth = tickSize + tickMargin;

    // calculate the updated width of the y-axis
    const updatedYAxisWidth = maxTickWidth + tickWidth + labelWidth + (label ? labelGapWithTick : 0);
    return Math.round(updatedYAxisWidth);
  }
  return 0;
};
exports.getCalculatedYAxisWidth = getCalculatedYAxisWidth;
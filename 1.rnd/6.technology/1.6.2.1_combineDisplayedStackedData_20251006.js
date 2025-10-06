"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.combineDisplayedStackedData = combineDisplayedStackedData;
const _getStackSeriesIdentifier = require("../../../util/stacks/getStackSeriesIdentifier");
const _ChartUtils = require("../../../util/ChartUtils");
/**
 * In a stacked chart, each graphical item has its own data. That data could be either:
 * - defined on the chart root, in which case the item gets a unique dataKey
 * - or defined on the item itself, in which case multiple items can share the same dataKey
 *
 * That means we cannot use the dataKey as a unique identifier for the item.
 *
 * This type represents a single data point in a stacked chart, where each key is a series identifier
 * and the value is the numeric value for that series using the numerical axis dataKey.
 */

function combineDisplayedStackedData(stackedGraphicalItems, _ref, tooltipAxisSettings) {
  const {
    chartData = []
  } = _ref;
  const {
    allowDuplicatedCategory,
    dataKey: tooltipDataKey
  } = tooltipAxisSettings;

  // A map of tooltip data keys to the stacked data points
  const knownItemsByDataKey = new Map();
  stackedGraphicalItems.forEach(item => {
    let _item$data;
    // If there is no data on the individual item then we use the root chart data
    const resolvedData = (_item$data = item.data) !== null && _item$data !== void 0 ? _item$data : chartData;
    if (resolvedData == null || resolvedData.length === 0) {
      // if that didn't work then we skip this item
      return;
    }
    const stackIdentifier = (0, _getStackSeriesIdentifier.getStackSeriesIdentifier)(item);
    resolvedData.forEach((entry, index) => {
      const tooltipValue = tooltipDataKey == null || allowDuplicatedCategory ? index : String((0, _ChartUtils.getValueByDataKey)(entry, tooltipDataKey, null));
      const numericValue = (0, _ChartUtils.getValueByDataKey)(entry, item.dataKey, 0);
      let curr;
      if (knownItemsByDataKey.has(tooltipValue)) {
        curr = knownItemsByDataKey.get(tooltipValue);
      } else {
        curr = {};
      }
      Object.assign(curr, {
        [stackIdentifier]: numericValue
      });
      knownItemsByDataKey.set(tooltipValue, curr);
    });
  });
  return Array.from(knownItemsByDataKey.values());
}
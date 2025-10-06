"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.combineActiveLabel = void 0;
const _DataUtils = require("../../../util/DataUtils");
const combineActiveLabel = (tooltipTicks, activeIndex) => {
  let _tooltipTicks$n;
  const n = Number(activeIndex);
  if ((0, _DataUtils.isNan)(n) || activeIndex == null) {
    return undefined;
  }
  return n >= 0 ? tooltipTicks === null || tooltipTicks === void 0 || (_tooltipTicks$n = tooltipTicks[n]) === null || _tooltipTicks$n === void 0 ? void 0 : _tooltipTicks$n.value : undefined;
};
exports.combineActiveLabel = combineActiveLabel;
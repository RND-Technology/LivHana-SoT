"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectLegendSize = exports.selectLegendSettings = exports.selectLegendPayload = void 0;
const _reselect = require("reselect");
const _sortBy = _interopRequireDefault(require("es-toolkit/compat/sortBy"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const selectLegendSettings = state => state.legend.settings;
exports.selectLegendSettings = selectLegendSettings;
const selectLegendSize = state => state.legend.size;
exports.selectLegendSize = selectLegendSize;
const selectAllLegendPayload2DArray = state => state.legend.payload;
const selectLegendPayload = exports.selectLegendPayload = (0, _reselect.createSelector)([selectAllLegendPayload2DArray, selectLegendSettings], (payloads, _ref) => {
  const {
    itemSorter
  } = _ref;
  const flat = payloads.flat(1);
  return itemSorter ? (0, _sortBy.default)(flat, itemSorter) : flat;
});
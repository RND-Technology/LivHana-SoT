"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.arrayTooltipSearcher = arrayTooltipSearcher;
exports.optionsReducer = exports.createEventEmitter = void 0;
const _toolkit = require("@reduxjs/toolkit");
const _DataUtils = require("../util/DataUtils");
/**
 * These chart options are decided internally, by Recharts,
 * and will not change during the lifetime of the chart.
 *
 * Changing these options can be done by swapping the root element
 * which will make a brand-new Redux store.
 *
 * If you want to store options that can be changed by the user,
 * use UpdatableChartOptions in rootPropsSlice.ts.
 */

function arrayTooltipSearcher(data, strIndex) {
  if (!strIndex) return undefined;
  const numIndex = Number.parseInt(strIndex, 10);
  if ((0, _DataUtils.isNan)(numIndex)) {
    return undefined;
  }
  return data === null || data === void 0 ? void 0 : data[numIndex];
}
const initialState = {
  chartName: '',
  tooltipPayloadSearcher: undefined,
  eventEmitter: undefined,
  defaultTooltipEventType: 'axis'
};
const optionsSlice = (0, _toolkit.createSlice)({
  name: 'options',
  initialState,
  reducers: {
    createEventEmitter: state => {
      if (state.eventEmitter == null) {
        state.eventEmitter = Symbol('rechartsEventEmitter');
      }
    }
  }
});
const optionsReducer = exports.optionsReducer = optionsSlice.reducer;
const {
  createEventEmitter
} = optionsSlice.actions;
exports.createEventEmitter = createEventEmitter;
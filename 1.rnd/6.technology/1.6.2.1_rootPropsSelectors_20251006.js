"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectSyncMethod = exports.selectSyncId = exports.selectStackOffsetType = exports.selectRootMaxBarSize = exports.selectRootBarSize = exports.selectEventEmitter = exports.selectChartName = exports.selectBarGap = exports.selectBarCategoryGap = void 0;
const selectRootMaxBarSize = state => state.rootProps.maxBarSize;
exports.selectRootMaxBarSize = selectRootMaxBarSize;
const selectBarGap = state => state.rootProps.barGap;
exports.selectBarGap = selectBarGap;
const selectBarCategoryGap = state => state.rootProps.barCategoryGap;
exports.selectBarCategoryGap = selectBarCategoryGap;
const selectRootBarSize = state => state.rootProps.barSize;
exports.selectRootBarSize = selectRootBarSize;
const selectStackOffsetType = state => state.rootProps.stackOffset;
exports.selectStackOffsetType = selectStackOffsetType;
const selectChartName = state => state.options.chartName;
exports.selectChartName = selectChartName;
const selectSyncId = state => state.rootProps.syncId;
exports.selectSyncId = selectSyncId;
const selectSyncMethod = state => state.rootProps.syncMethod;
exports.selectSyncMethod = selectSyncMethod;
const selectEventEmitter = state => state.options.eventEmitter;
exports.selectEventEmitter = selectEventEmitter;
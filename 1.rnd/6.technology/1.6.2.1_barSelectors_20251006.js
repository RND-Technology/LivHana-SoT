"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectMaxBarSize = exports.selectBarSizeList = exports.selectBarRectangles = exports.selectBarPosition = exports.selectBarCartesianAxisSize = exports.selectBarBandSize = exports.selectAxisBandSize = exports.selectAllVisibleBars = exports.selectAllBarPositions = exports.combineStackedData = exports.combineBarSizeList = exports.combineAllBarPositions = void 0;
const _reselect = require("reselect");
const _axisSelectors = require("./axisSelectors");
const _DataUtils = require("../../util/DataUtils");
const _ChartUtils = require("../../util/ChartUtils");
const _Bar = require("../../cartesian/Bar");
const _chartLayoutContext = require("../../context/chartLayoutContext");
const _dataSelectors = require("./dataSelectors");
const _selectChartOffsetInternal = require("./selectChartOffsetInternal");
const _rootPropsSelectors = require("./rootPropsSelectors");
const _isWellBehavedNumber = require("../../util/isWellBehavedNumber");
const _getStackSeriesIdentifier = require("../../util/stacks/getStackSeriesIdentifier");
const _StackedGraphicalItem = require("../types/StackedGraphicalItem");
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const pickXAxisId = (_state, xAxisId) => xAxisId;
const pickYAxisId = (_state, _xAxisId, yAxisId) => yAxisId;
const pickIsPanorama = (_state, _xAxisId, _yAxisId, isPanorama) => isPanorama;
const pickBarId = (_state, _xAxisId, _yAxisId, _isPanorama, id) => id;
const selectSynchronisedBarSettings = (0, _reselect.createSelector)([_axisSelectors.selectUnfilteredCartesianItems, pickBarId], (graphicalItems, id) => graphicalItems.filter(item => item.type === 'bar').find(item => item.id === id));
const selectMaxBarSize = exports.selectMaxBarSize = (0, _reselect.createSelector)([selectSynchronisedBarSettings], barSettings => barSettings === null || barSettings === void 0 ? void 0 : barSettings.maxBarSize);
const pickCells = (_state, _xAxisId, _yAxisId, _isPanorama, _id, cells) => cells;
const getBarSize = (globalSize, totalSize, selfSize) => {
  const barSize = selfSize !== null && selfSize !== void 0 ? selfSize : globalSize;
  if ((0, _DataUtils.isNullish)(barSize)) {
    return undefined;
  }
  return (0, _DataUtils.getPercentValue)(barSize, totalSize, 0);
};
const selectAllVisibleBars = exports.selectAllVisibleBars = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, _axisSelectors.selectUnfilteredCartesianItems, pickXAxisId, pickYAxisId, pickIsPanorama], (layout, allItems, xAxisId, yAxisId, isPanorama) => allItems.filter(i => {
  if (layout === 'horizontal') {
    return i.xAxisId === xAxisId;
  }
  return i.yAxisId === yAxisId;
}).filter(i => i.isPanorama === isPanorama).filter(i => i.hide === false).filter(i => i.type === 'bar'));
const selectBarStackGroups = (state, xAxisId, yAxisId, isPanorama) => {
  const layout = (0, _chartLayoutContext.selectChartLayout)(state);
  if (layout === 'horizontal') {
    return (0, _axisSelectors.selectStackGroups)(state, 'yAxis', yAxisId, isPanorama);
  }
  return (0, _axisSelectors.selectStackGroups)(state, 'xAxis', xAxisId, isPanorama);
};
const selectBarCartesianAxisSize = (state, xAxisId, yAxisId) => {
  const layout = (0, _chartLayoutContext.selectChartLayout)(state);
  if (layout === 'horizontal') {
    return (0, _axisSelectors.selectCartesianAxisSize)(state, 'xAxis', xAxisId);
  }
  return (0, _axisSelectors.selectCartesianAxisSize)(state, 'yAxis', yAxisId);
};
exports.selectBarCartesianAxisSize = selectBarCartesianAxisSize;
const combineBarSizeList = (allBars, globalSize, totalSize) => {
  const initialValue = {};
  const stackedBars = allBars.filter(_StackedGraphicalItem.isStacked);
  const unstackedBars = allBars.filter(b => b.stackId == null);
  const groupByStack = stackedBars.reduce((acc, bar) => {
    if (!acc[bar.stackId]) {
      acc[bar.stackId] = [];
    }
    acc[bar.stackId].push(bar);
    return acc;
  }, initialValue);
  const stackedSizeList = Object.entries(groupByStack).map(_ref => {
    const [stackId, bars] = _ref;
    const dataKeys = bars.map(b => b.dataKey);
    const barSize = getBarSize(globalSize, totalSize, bars[0].barSize);
    return {
      stackId,
      dataKeys,
      barSize
    };
  });
  const unstackedSizeList = unstackedBars.map(b => {
    const dataKeys = [b.dataKey].filter(dk => dk != null);
    const barSize = getBarSize(globalSize, totalSize, b.barSize);
    return {
      stackId: undefined,
      dataKeys,
      barSize
    };
  });
  return [...stackedSizeList, ...unstackedSizeList];
};
exports.combineBarSizeList = combineBarSizeList;
const selectBarSizeList = exports.selectBarSizeList = (0, _reselect.createSelector)([selectAllVisibleBars, _rootPropsSelectors.selectRootBarSize, selectBarCartesianAxisSize], combineBarSizeList);
const selectBarBandSize = (state, xAxisId, yAxisId, isPanorama, id) => {
  let _ref2, _getBandSizeOfAxis;
  const barSettings = selectSynchronisedBarSettings(state, xAxisId, yAxisId, isPanorama, id);
  if (barSettings == null) {
    return undefined;
  }
  const layout = (0, _chartLayoutContext.selectChartLayout)(state);
  const globalMaxBarSize = (0, _rootPropsSelectors.selectRootMaxBarSize)(state);
  const {
    maxBarSize: childMaxBarSize
  } = barSettings;
  const maxBarSize = (0, _DataUtils.isNullish)(childMaxBarSize) ? globalMaxBarSize : childMaxBarSize;
  let axis, ticks;
  if (layout === 'horizontal') {
    axis = (0, _axisSelectors.selectAxisWithScale)(state, 'xAxis', xAxisId, isPanorama);
    ticks = (0, _axisSelectors.selectTicksOfGraphicalItem)(state, 'xAxis', xAxisId, isPanorama);
  } else {
    axis = (0, _axisSelectors.selectAxisWithScale)(state, 'yAxis', yAxisId, isPanorama);
    ticks = (0, _axisSelectors.selectTicksOfGraphicalItem)(state, 'yAxis', yAxisId, isPanorama);
  }
  return (_ref2 = (_getBandSizeOfAxis = (0, _ChartUtils.getBandSizeOfAxis)(axis, ticks, true)) !== null && _getBandSizeOfAxis !== void 0 ? _getBandSizeOfAxis : maxBarSize) !== null && _ref2 !== void 0 ? _ref2 : 0;
};
exports.selectBarBandSize = selectBarBandSize;
const selectAxisBandSize = (state, xAxisId, yAxisId, isPanorama) => {
  const layout = (0, _chartLayoutContext.selectChartLayout)(state);
  let axis, ticks;
  if (layout === 'horizontal') {
    axis = (0, _axisSelectors.selectAxisWithScale)(state, 'xAxis', xAxisId, isPanorama);
    ticks = (0, _axisSelectors.selectTicksOfGraphicalItem)(state, 'xAxis', xAxisId, isPanorama);
  } else {
    axis = (0, _axisSelectors.selectAxisWithScale)(state, 'yAxis', yAxisId, isPanorama);
    ticks = (0, _axisSelectors.selectTicksOfGraphicalItem)(state, 'yAxis', yAxisId, isPanorama);
  }
  return (0, _ChartUtils.getBandSizeOfAxis)(axis, ticks);
};
exports.selectAxisBandSize = selectAxisBandSize;
function getBarPositions(barGap, barCategoryGap, bandSize, sizeList, maxBarSize) {
  const len = sizeList.length;
  if (len < 1) {
    return undefined;
  }
  let realBarGap = (0, _DataUtils.getPercentValue)(barGap, bandSize, 0, true);
  let result;
  const initialValue = [];

  // whether is barSize set by user
  // Okay but why does it check only for the first element? What if the first element is set but others are not?
  if ((0, _isWellBehavedNumber.isWellBehavedNumber)(sizeList[0].barSize)) {
    let useFull = false;
    let fullBarSize = bandSize / len;
    let sum = sizeList.reduce((res, entry) => res + (entry.barSize || 0), 0);
    sum += (len - 1) * realBarGap;
    if (sum >= bandSize) {
      sum -= (len - 1) * realBarGap;
      realBarGap = 0;
    }
    if (sum >= bandSize && fullBarSize > 0) {
      useFull = true;
      fullBarSize *= 0.9;
      sum = len * fullBarSize;
    }
    const offset = (bandSize - sum) / 2 >> 0;
    let prev = {
      offset: offset - realBarGap,
      size: 0
    };
    result = sizeList.reduce((res, entry) => {
      let _entry$barSize;
      const newPosition = {
        stackId: entry.stackId,
        dataKeys: entry.dataKeys,
        position: {
          offset: prev.offset + prev.size + realBarGap,
          size: useFull ? fullBarSize : (_entry$barSize = entry.barSize) !== null && _entry$barSize !== void 0 ? _entry$barSize : 0
        }
      };
      const newRes = [...res, newPosition];
      prev = newRes[newRes.length - 1].position;
      return newRes;
    }, initialValue);
  } else {
    const _offset = (0, _DataUtils.getPercentValue)(barCategoryGap, bandSize, 0, true);
    if (bandSize - 2 * _offset - (len - 1) * realBarGap <= 0) {
      realBarGap = 0;
    }
    let originalSize = (bandSize - 2 * _offset - (len - 1) * realBarGap) / len;
    if (originalSize > 1) {
      originalSize >>= 0;
    }
    const size = (0, _isWellBehavedNumber.isWellBehavedNumber)(maxBarSize) ? Math.min(originalSize, maxBarSize) : originalSize;
    result = sizeList.reduce((res, entry, i) => [...res, {
      stackId: entry.stackId,
      dataKeys: entry.dataKeys,
      position: {
        offset: _offset + (originalSize + realBarGap) * i + (originalSize - size) / 2,
        size
      }
    }], initialValue);
  }
  return result;
}
const combineAllBarPositions = (sizeList, globalMaxBarSize, barGap, barCategoryGap, barBandSize, bandSize, childMaxBarSize) => {
  const maxBarSize = (0, _DataUtils.isNullish)(childMaxBarSize) ? globalMaxBarSize : childMaxBarSize;
  let allBarPositions = getBarPositions(barGap, barCategoryGap, barBandSize !== bandSize ? barBandSize : bandSize, sizeList, maxBarSize);
  if (barBandSize !== bandSize && allBarPositions != null) {
    allBarPositions = allBarPositions.map(pos => _objectSpread(_objectSpread({}, pos), {}, {
      position: _objectSpread(_objectSpread({}, pos.position), {}, {
        offset: pos.position.offset - barBandSize / 2
      })
    }));
  }
  return allBarPositions;
};
exports.combineAllBarPositions = combineAllBarPositions;
const selectAllBarPositions = exports.selectAllBarPositions = (0, _reselect.createSelector)([selectBarSizeList, _rootPropsSelectors.selectRootMaxBarSize, _rootPropsSelectors.selectBarGap, _rootPropsSelectors.selectBarCategoryGap, selectBarBandSize, selectAxisBandSize, selectMaxBarSize], combineAllBarPositions);
const selectXAxisWithScale = (state, xAxisId, _yAxisId, isPanorama) => (0, _axisSelectors.selectAxisWithScale)(state, 'xAxis', xAxisId, isPanorama);
const selectYAxisWithScale = (state, _xAxisId, yAxisId, isPanorama) => (0, _axisSelectors.selectAxisWithScale)(state, 'yAxis', yAxisId, isPanorama);
const selectXAxisTicks = (state, xAxisId, _yAxisId, isPanorama) => (0, _axisSelectors.selectTicksOfGraphicalItem)(state, 'xAxis', xAxisId, isPanorama);
const selectYAxisTicks = (state, _xAxisId, yAxisId, isPanorama) => (0, _axisSelectors.selectTicksOfGraphicalItem)(state, 'yAxis', yAxisId, isPanorama);
const selectBarPosition = exports.selectBarPosition = (0, _reselect.createSelector)([selectAllBarPositions, selectSynchronisedBarSettings], (allBarPositions, barSettings) => {
  if (allBarPositions == null || barSettings == null) {
    return undefined;
  }
  const position = allBarPositions.find(p => p.stackId === barSettings.stackId && barSettings.dataKey != null && p.dataKeys.includes(barSettings.dataKey));
  if (position == null) {
    return undefined;
  }
  return position.position;
});
const combineStackedData = (stackGroups, barSettings) => {
  const stackSeriesIdentifier = (0, _getStackSeriesIdentifier.getStackSeriesIdentifier)(barSettings);
  if (!stackGroups || stackSeriesIdentifier == null || barSettings == null) {
    return undefined;
  }
  const {
    stackId
  } = barSettings;
  if (stackId == null) {
    return undefined;
  }
  const stackGroup = stackGroups[stackId];
  if (!stackGroup) {
    return undefined;
  }
  const {
    stackedData
  } = stackGroup;
  if (!stackedData) {
    return undefined;
  }
  return stackedData.find(sd => sd.key === stackSeriesIdentifier);
};
exports.combineStackedData = combineStackedData;
const selectStackedDataOfItem = (0, _reselect.createSelector)([selectBarStackGroups, selectSynchronisedBarSettings], combineStackedData);
const selectBarRectangles = exports.selectBarRectangles = (0, _reselect.createSelector)([_selectChartOffsetInternal.selectChartOffsetInternal, _selectChartOffsetInternal.selectAxisViewBox, selectXAxisWithScale, selectYAxisWithScale, selectXAxisTicks, selectYAxisTicks, selectBarPosition, _chartLayoutContext.selectChartLayout, _dataSelectors.selectChartDataWithIndexesIfNotInPanorama, selectAxisBandSize, selectStackedDataOfItem, selectSynchronisedBarSettings, pickCells], (offset, axisViewBox, xAxis, yAxis, xAxisTicks, yAxisTicks, pos, layout, _ref3, bandSize, stackedData, barSettings, cells) => {
  const {
    chartData,
    dataStartIndex,
    dataEndIndex
  } = _ref3;
  if (barSettings == null || pos == null || axisViewBox == null || layout !== 'horizontal' && layout !== 'vertical' || xAxis == null || yAxis == null || xAxisTicks == null || yAxisTicks == null || bandSize == null) {
    return undefined;
  }
  const {
    data
  } = barSettings;
  let displayedData;
  if (data != null && data.length > 0) {
    displayedData = data;
  } else {
    displayedData = chartData === null || chartData === void 0 ? void 0 : chartData.slice(dataStartIndex, dataEndIndex + 1);
  }
  if (displayedData == null) {
    return undefined;
  }
  return (0, _Bar.computeBarRectangles)({
    layout,
    barSettings,
    pos,
    parentViewBox: axisViewBox,
    bandSize,
    xAxis,
    yAxis,
    xAxisTicks,
    yAxisTicks,
    stackedData,
    displayedData,
    offset,
    cells
  });
});
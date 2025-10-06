"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectUnfilteredPolarItems = exports.selectPolarNiceTicks = exports.selectPolarItemsSettings = exports.selectPolarDisplayedData = exports.selectPolarAxisDomainIncludingNiceTicks = exports.selectPolarAxisDomain = exports.selectPolarAppliedValues = exports.selectAllPolarAppliedNumericalValues = void 0;
const _reselect = require("reselect");
const _dataSelectors = require("./dataSelectors");
const _axisSelectors = require("./axisSelectors");
const _chartLayoutContext = require("../../context/chartLayoutContext");
const _ChartUtils = require("../../util/ChartUtils");
const _pickAxisType = require("./pickAxisType");
const _pickAxisId = require("./pickAxisId");
const _rootPropsSelectors = require("./rootPropsSelectors");
const selectUnfilteredPolarItems = state => state.graphicalItems.polarItems;
exports.selectUnfilteredPolarItems = selectUnfilteredPolarItems;
const selectAxisPredicate = (0, _reselect.createSelector)([_pickAxisType.pickAxisType, _pickAxisId.pickAxisId], _axisSelectors.itemAxisPredicate);
const selectPolarItemsSettings = exports.selectPolarItemsSettings = (0, _reselect.createSelector)([selectUnfilteredPolarItems, _axisSelectors.selectBaseAxis, selectAxisPredicate], _axisSelectors.combineGraphicalItemsSettings);
const selectPolarGraphicalItemsData = (0, _reselect.createSelector)([selectPolarItemsSettings], _axisSelectors.combineGraphicalItemsData);
const selectPolarDisplayedData = exports.selectPolarDisplayedData = (0, _reselect.createSelector)([selectPolarGraphicalItemsData, _dataSelectors.selectChartDataAndAlwaysIgnoreIndexes], _axisSelectors.combineDisplayedData);
const selectPolarAppliedValues = exports.selectPolarAppliedValues = (0, _reselect.createSelector)([selectPolarDisplayedData, _axisSelectors.selectBaseAxis, selectPolarItemsSettings], _axisSelectors.combineAppliedValues);
const selectAllPolarAppliedNumericalValues = exports.selectAllPolarAppliedNumericalValues = (0, _reselect.createSelector)([selectPolarDisplayedData, _axisSelectors.selectBaseAxis, selectPolarItemsSettings], (data, axisSettings, items) => {
  if (items.length > 0) {
    return data.flatMap(entry => {
      return items.flatMap(item => {
        let _axisSettings$dataKey;
        const valueByDataKey = (0, _ChartUtils.getValueByDataKey)(entry, (_axisSettings$dataKey = axisSettings.dataKey) !== null && _axisSettings$dataKey !== void 0 ? _axisSettings$dataKey : item.dataKey);
        return {
          value: valueByDataKey,
          errorDomain: [] // polar charts do not have error bars
        };
      });
    }).filter(Boolean);
  }
  if ((axisSettings === null || axisSettings === void 0 ? void 0 : axisSettings.dataKey) != null) {
    return data.map(item => ({
      value: (0, _ChartUtils.getValueByDataKey)(item, axisSettings.dataKey),
      errorDomain: []
    }));
  }
  return data.map(entry => ({
    value: entry,
    errorDomain: []
  }));
});
const unsupportedInPolarChart = () => undefined;
const selectPolarNumericalDomain = (0, _reselect.createSelector)([_axisSelectors.selectBaseAxis, _axisSelectors.selectDomainDefinition, unsupportedInPolarChart, selectAllPolarAppliedNumericalValues, unsupportedInPolarChart, _chartLayoutContext.selectChartLayout, _pickAxisType.pickAxisType], _axisSelectors.combineNumericalDomain);
const selectPolarAxisDomain = exports.selectPolarAxisDomain = (0, _reselect.createSelector)([_axisSelectors.selectBaseAxis, _chartLayoutContext.selectChartLayout, selectPolarDisplayedData, selectPolarAppliedValues, _rootPropsSelectors.selectStackOffsetType, _pickAxisType.pickAxisType, selectPolarNumericalDomain], _axisSelectors.combineAxisDomain);
const selectPolarNiceTicks = exports.selectPolarNiceTicks = (0, _reselect.createSelector)([selectPolarAxisDomain, _axisSelectors.selectBaseAxis, _axisSelectors.selectRealScaleType], _axisSelectors.combineNiceTicks);
const selectPolarAxisDomainIncludingNiceTicks = exports.selectPolarAxisDomainIncludingNiceTicks = (0, _reselect.createSelector)([_axisSelectors.selectBaseAxis, selectPolarAxisDomain, selectPolarNiceTicks, _pickAxisType.pickAxisType], _axisSelectors.combineAxisDomainWithNiceTicks);
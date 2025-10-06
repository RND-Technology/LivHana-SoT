"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectTooltipGraphicalItemsData = exports.selectTooltipDisplayedData = exports.selectTooltipCategoricalDomain = exports.selectTooltipAxisTicks = exports.selectTooltipAxisScale = exports.selectTooltipAxisRealScaleType = exports.selectTooltipAxisRangeWithReverse = exports.selectTooltipAxisDomainIncludingNiceTicks = exports.selectTooltipAxisDomain = exports.selectIsTooltipActive = exports.selectAllUnfilteredGraphicalItems = exports.selectAllGraphicalItemsSettings = exports.selectActiveTooltipPayload = exports.selectActiveTooltipIndex = exports.selectActiveTooltipDataPoints = exports.selectActiveTooltipDataKey = exports.selectActiveTooltipCoordinate = exports.selectActiveLabel = void 0;
const _reselect = require("reselect");
const _axisSelectors = require("./axisSelectors");
const _chartLayoutContext = require("../../context/chartLayoutContext");
const _ChartUtils = require("../../util/ChartUtils");
const _dataSelectors = require("./dataSelectors");
const _rootPropsSelectors = require("./rootPropsSelectors");
const _DataUtils = require("../../util/DataUtils");
const _combineAxisRangeWithReverse = require("./combiners/combineAxisRangeWithReverse");
const _selectTooltipEventType = require("./selectTooltipEventType");
const _combineActiveLabel = require("./combiners/combineActiveLabel");
const _selectTooltipSettings = require("./selectTooltipSettings");
const _combineTooltipInteractionState = require("./combiners/combineTooltipInteractionState");
const _combineActiveTooltipIndex = require("./combiners/combineActiveTooltipIndex");
const _combineCoordinateForDefaultIndex = require("./combiners/combineCoordinateForDefaultIndex");
const _containerSelectors = require("./containerSelectors");
const _selectChartOffsetInternal = require("./selectChartOffsetInternal");
const _combineTooltipPayloadConfigurations = require("./combiners/combineTooltipPayloadConfigurations");
const _selectTooltipPayloadSearcher = require("./selectTooltipPayloadSearcher");
const _selectTooltipState = require("./selectTooltipState");
const _combineTooltipPayload = require("./combiners/combineTooltipPayload");
const _selectTooltipAxisId = require("./selectTooltipAxisId");
const _selectTooltipAxisType = require("./selectTooltipAxisType");
const _selectTooltipAxis = require("./selectTooltipAxis");
const _combineDisplayedStackedData = require("./combiners/combineDisplayedStackedData");
const _StackedGraphicalItem = require("../types/StackedGraphicalItem");
const selectTooltipAxisRealScaleType = exports.selectTooltipAxisRealScaleType = (0, _reselect.createSelector)([_selectTooltipAxis.selectTooltipAxis, _chartLayoutContext.selectChartLayout, _axisSelectors.selectHasBar, _rootPropsSelectors.selectChartName, _selectTooltipAxisType.selectTooltipAxisType], _axisSelectors.combineRealScaleType);
const selectAllUnfilteredGraphicalItems = exports.selectAllUnfilteredGraphicalItems = (0, _reselect.createSelector)([state => state.graphicalItems.cartesianItems, state => state.graphicalItems.polarItems], (cartesianItems, polarItems) => [...cartesianItems, ...polarItems]);
const selectTooltipAxisPredicate = (0, _reselect.createSelector)([_selectTooltipAxisType.selectTooltipAxisType, _selectTooltipAxisId.selectTooltipAxisId], _axisSelectors.itemAxisPredicate);
const selectAllGraphicalItemsSettings = exports.selectAllGraphicalItemsSettings = (0, _reselect.createSelector)([selectAllUnfilteredGraphicalItems, _selectTooltipAxis.selectTooltipAxis, selectTooltipAxisPredicate], _axisSelectors.combineGraphicalItemsSettings);
const selectAllStackedGraphicalItemsSettings = (0, _reselect.createSelector)([selectAllGraphicalItemsSettings], graphicalItems => graphicalItems.filter(_StackedGraphicalItem.isStacked));
const selectTooltipGraphicalItemsData = exports.selectTooltipGraphicalItemsData = (0, _reselect.createSelector)([selectAllGraphicalItemsSettings], _axisSelectors.combineGraphicalItemsData);

/**
 * Data for tooltip always use the data with indexes set by a Brush,
 * and never accept the isPanorama flag:
 * because Tooltip never displays inside the panorama anyway
 * so we don't need to worry what would happen there.
 */
const selectTooltipDisplayedData = exports.selectTooltipDisplayedData = (0, _reselect.createSelector)([selectTooltipGraphicalItemsData, _dataSelectors.selectChartDataWithIndexes], _axisSelectors.combineDisplayedData);
const selectTooltipStackedData = (0, _reselect.createSelector)([selectAllStackedGraphicalItemsSettings, _dataSelectors.selectChartDataWithIndexes, _selectTooltipAxis.selectTooltipAxis], _combineDisplayedStackedData.combineDisplayedStackedData);
const selectAllTooltipAppliedValues = (0, _reselect.createSelector)([selectTooltipDisplayedData, _selectTooltipAxis.selectTooltipAxis, selectAllGraphicalItemsSettings], _axisSelectors.combineAppliedValues);
const selectTooltipAxisDomainDefinition = (0, _reselect.createSelector)([_selectTooltipAxis.selectTooltipAxis], _axisSelectors.getDomainDefinition);
const selectAllStackedGraphicalItems = (0, _reselect.createSelector)([selectAllGraphicalItemsSettings], graphicalItems => graphicalItems.filter(_StackedGraphicalItem.isStacked));
const selectTooltipStackGroups = (0, _reselect.createSelector)([selectTooltipStackedData, selectAllStackedGraphicalItems, _rootPropsSelectors.selectStackOffsetType], _axisSelectors.combineStackGroups);
const selectTooltipDomainOfStackGroups = (0, _reselect.createSelector)([selectTooltipStackGroups, _dataSelectors.selectChartDataWithIndexes, _selectTooltipAxisType.selectTooltipAxisType], _axisSelectors.combineDomainOfStackGroups);
const selectTooltipItemsSettingsExceptStacked = (0, _reselect.createSelector)([selectAllGraphicalItemsSettings], _axisSelectors.filterGraphicalNotStackedItems);
const selectTooltipAllAppliedNumericalValuesIncludingErrorValues = (0, _reselect.createSelector)([selectTooltipDisplayedData, _selectTooltipAxis.selectTooltipAxis, selectTooltipItemsSettingsExceptStacked, _axisSelectors.selectAllErrorBarSettings, _selectTooltipAxisType.selectTooltipAxisType], _axisSelectors.combineAppliedNumericalValuesIncludingErrorValues);
const selectReferenceDotsByTooltipAxis = (0, _reselect.createSelector)([_axisSelectors.selectReferenceDots, _selectTooltipAxisType.selectTooltipAxisType, _selectTooltipAxisId.selectTooltipAxisId], _axisSelectors.filterReferenceElements);
const selectTooltipReferenceDotsDomain = (0, _reselect.createSelector)([selectReferenceDotsByTooltipAxis, _selectTooltipAxisType.selectTooltipAxisType], _axisSelectors.combineDotsDomain);
const selectReferenceAreasByTooltipAxis = (0, _reselect.createSelector)([_axisSelectors.selectReferenceAreas, _selectTooltipAxisType.selectTooltipAxisType, _selectTooltipAxisId.selectTooltipAxisId], _axisSelectors.filterReferenceElements);
const selectTooltipReferenceAreasDomain = (0, _reselect.createSelector)([selectReferenceAreasByTooltipAxis, _selectTooltipAxisType.selectTooltipAxisType], _axisSelectors.combineAreasDomain);
const selectReferenceLinesByTooltipAxis = (0, _reselect.createSelector)([_axisSelectors.selectReferenceLines, _selectTooltipAxisType.selectTooltipAxisType, _selectTooltipAxisId.selectTooltipAxisId], _axisSelectors.filterReferenceElements);
const selectTooltipReferenceLinesDomain = (0, _reselect.createSelector)([selectReferenceLinesByTooltipAxis, _selectTooltipAxisType.selectTooltipAxisType], _axisSelectors.combineLinesDomain);
const selectTooltipReferenceElementsDomain = (0, _reselect.createSelector)([selectTooltipReferenceDotsDomain, selectTooltipReferenceLinesDomain, selectTooltipReferenceAreasDomain], _axisSelectors.mergeDomains);
const selectTooltipNumericalDomain = (0, _reselect.createSelector)([_selectTooltipAxis.selectTooltipAxis, selectTooltipAxisDomainDefinition, selectTooltipDomainOfStackGroups, selectTooltipAllAppliedNumericalValuesIncludingErrorValues, selectTooltipReferenceElementsDomain, _chartLayoutContext.selectChartLayout, _selectTooltipAxisType.selectTooltipAxisType], _axisSelectors.combineNumericalDomain);
const selectTooltipAxisDomain = exports.selectTooltipAxisDomain = (0, _reselect.createSelector)([_selectTooltipAxis.selectTooltipAxis, _chartLayoutContext.selectChartLayout, selectTooltipDisplayedData, selectAllTooltipAppliedValues, _rootPropsSelectors.selectStackOffsetType, _selectTooltipAxisType.selectTooltipAxisType, selectTooltipNumericalDomain], _axisSelectors.combineAxisDomain);
const selectTooltipNiceTicks = (0, _reselect.createSelector)([selectTooltipAxisDomain, _selectTooltipAxis.selectTooltipAxis, selectTooltipAxisRealScaleType], _axisSelectors.combineNiceTicks);
const selectTooltipAxisDomainIncludingNiceTicks = exports.selectTooltipAxisDomainIncludingNiceTicks = (0, _reselect.createSelector)([_selectTooltipAxis.selectTooltipAxis, selectTooltipAxisDomain, selectTooltipNiceTicks, _selectTooltipAxisType.selectTooltipAxisType], _axisSelectors.combineAxisDomainWithNiceTicks);
const selectTooltipAxisRange = state => {
  const axisType = (0, _selectTooltipAxisType.selectTooltipAxisType)(state);
  const axisId = (0, _selectTooltipAxisId.selectTooltipAxisId)(state);
  const isPanorama = false; // Tooltip never displays in panorama so this is safe to assume
  return (0, _axisSelectors.selectAxisRange)(state, axisType, axisId, isPanorama);
};
const selectTooltipAxisRangeWithReverse = exports.selectTooltipAxisRangeWithReverse = (0, _reselect.createSelector)([_selectTooltipAxis.selectTooltipAxis, selectTooltipAxisRange], _combineAxisRangeWithReverse.combineAxisRangeWithReverse);
const selectTooltipAxisScale = exports.selectTooltipAxisScale = (0, _reselect.createSelector)([_selectTooltipAxis.selectTooltipAxis, selectTooltipAxisRealScaleType, selectTooltipAxisDomainIncludingNiceTicks, selectTooltipAxisRangeWithReverse], _axisSelectors.combineScaleFunction);
const selectTooltipDuplicateDomain = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, selectAllTooltipAppliedValues, _selectTooltipAxis.selectTooltipAxis, _selectTooltipAxisType.selectTooltipAxisType], _axisSelectors.combineDuplicateDomain);
const selectTooltipCategoricalDomain = exports.selectTooltipCategoricalDomain = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, selectAllTooltipAppliedValues, _selectTooltipAxis.selectTooltipAxis, _selectTooltipAxisType.selectTooltipAxisType], _axisSelectors.combineCategoricalDomain);
const combineTicksOfTooltipAxis = (layout, axis, realScaleType, scale, range, duplicateDomain, categoricalDomain, axisType) => {
  if (!axis) {
    return undefined;
  }
  const {
    type
  } = axis;
  const isCategorical = (0, _ChartUtils.isCategoricalAxis)(layout, axisType);
  if (!scale) {
    return undefined;
  }
  const offsetForBand = realScaleType === 'scaleBand' && scale.bandwidth ? scale.bandwidth() / 2 : 2;
  let offset = type === 'category' && scale.bandwidth ? scale.bandwidth() / offsetForBand : 0;
  offset = axisType === 'angleAxis' && range != null && (range === null || range === void 0 ? void 0 : range.length) >= 2 ? (0, _DataUtils.mathSign)(range[0] - range[1]) * 2 * offset : offset;

  // When axis is a categorical axis, but the type of axis is number or the scale of axis is not "auto"
  if (isCategorical && categoricalDomain) {
    return categoricalDomain.map((entry, index) => ({
      coordinate: scale(entry) + offset,
      value: entry,
      index,
      offset
    }));
  }

  // When axis has duplicated text, serial numbers are used to generate scale
  return scale.domain().map((entry, index) => ({
    coordinate: scale(entry) + offset,
    value: duplicateDomain ? duplicateDomain[entry] : entry,
    index,
    offset
  }));
};
const selectTooltipAxisTicks = exports.selectTooltipAxisTicks = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, _selectTooltipAxis.selectTooltipAxis, selectTooltipAxisRealScaleType, selectTooltipAxisScale, selectTooltipAxisRange, selectTooltipDuplicateDomain, selectTooltipCategoricalDomain, _selectTooltipAxisType.selectTooltipAxisType], combineTicksOfTooltipAxis);
const selectTooltipEventType = (0, _reselect.createSelector)([_selectTooltipEventType.selectDefaultTooltipEventType, _selectTooltipEventType.selectValidateTooltipEventTypes, _selectTooltipSettings.selectTooltipSettings], (defaultTooltipEventType, validateTooltipEventType, settings) => (0, _selectTooltipEventType.combineTooltipEventType)(settings.shared, defaultTooltipEventType, validateTooltipEventType));
const selectTooltipTrigger = state => state.tooltip.settings.trigger;
const selectDefaultIndex = state => state.tooltip.settings.defaultIndex;
const selectTooltipInteractionState = (0, _reselect.createSelector)([_selectTooltipState.selectTooltipState, selectTooltipEventType, selectTooltipTrigger, selectDefaultIndex], _combineTooltipInteractionState.combineTooltipInteractionState);
const selectActiveTooltipIndex = exports.selectActiveTooltipIndex = (0, _reselect.createSelector)([selectTooltipInteractionState, selectTooltipDisplayedData], _combineActiveTooltipIndex.combineActiveTooltipIndex);
const selectActiveLabel = exports.selectActiveLabel = (0, _reselect.createSelector)([selectTooltipAxisTicks, selectActiveTooltipIndex], _combineActiveLabel.combineActiveLabel);
const selectActiveTooltipDataKey = exports.selectActiveTooltipDataKey = (0, _reselect.createSelector)([selectTooltipInteractionState], tooltipInteraction => {
  if (!tooltipInteraction) {
    return undefined;
  }
  return tooltipInteraction.dataKey;
});
const selectTooltipPayloadConfigurations = (0, _reselect.createSelector)([_selectTooltipState.selectTooltipState, selectTooltipEventType, selectTooltipTrigger, selectDefaultIndex], _combineTooltipPayloadConfigurations.combineTooltipPayloadConfigurations);
const selectTooltipCoordinateForDefaultIndex = (0, _reselect.createSelector)([_containerSelectors.selectChartWidth, _containerSelectors.selectChartHeight, _chartLayoutContext.selectChartLayout, _selectChartOffsetInternal.selectChartOffsetInternal, selectTooltipAxisTicks, selectDefaultIndex, selectTooltipPayloadConfigurations, _selectTooltipPayloadSearcher.selectTooltipPayloadSearcher], _combineCoordinateForDefaultIndex.combineCoordinateForDefaultIndex);
const selectActiveTooltipCoordinate = exports.selectActiveTooltipCoordinate = (0, _reselect.createSelector)([selectTooltipInteractionState, selectTooltipCoordinateForDefaultIndex], (tooltipInteractionState, defaultIndexCoordinate) => {
  if (tooltipInteractionState !== null && tooltipInteractionState !== void 0 && tooltipInteractionState.coordinate) {
    return tooltipInteractionState.coordinate;
  }
  return defaultIndexCoordinate;
});
const selectIsTooltipActive = exports.selectIsTooltipActive = (0, _reselect.createSelector)([selectTooltipInteractionState], tooltipInteractionState => tooltipInteractionState.active);
const selectActiveTooltipPayload = exports.selectActiveTooltipPayload = (0, _reselect.createSelector)([selectTooltipPayloadConfigurations, selectActiveTooltipIndex, _dataSelectors.selectChartDataWithIndexes, _selectTooltipAxis.selectTooltipAxisDataKey, selectActiveLabel, _selectTooltipPayloadSearcher.selectTooltipPayloadSearcher, selectTooltipEventType], _combineTooltipPayload.combineTooltipPayload);
const selectActiveTooltipDataPoints = exports.selectActiveTooltipDataPoints = (0, _reselect.createSelector)([selectActiveTooltipPayload], payload => {
  if (payload == null) {
    return undefined;
  }
  const dataPoints = payload.map(p => p.payload).filter(p => p != null);
  return Array.from(new Set(dataPoints));
});
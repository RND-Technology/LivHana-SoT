"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectTooltipCoordinate = void 0;
const _reselect = require("reselect");
const _selectTooltipPayloadSearcher = require("./selectTooltipPayloadSearcher");
const _selectTooltipState = require("./selectTooltipState");
const selectAllTooltipPayloadConfiguration = (0, _reselect.createSelector)([_selectTooltipState.selectTooltipState], tooltipState => tooltipState.tooltipItemPayloads);
const selectTooltipCoordinate = exports.selectTooltipCoordinate = (0, _reselect.createSelector)([selectAllTooltipPayloadConfiguration, _selectTooltipPayloadSearcher.selectTooltipPayloadSearcher, (_state, tooltipIndex, _dataKey) => tooltipIndex, (_state, _tooltipIndex, dataKey) => dataKey], (allTooltipConfigurations, tooltipPayloadSearcher, tooltipIndex, dataKey) => {
  const mostRelevantTooltipConfiguration = allTooltipConfigurations.find(tooltipConfiguration => {
    return tooltipConfiguration.settings.dataKey === dataKey;
  });
  if (mostRelevantTooltipConfiguration == null) {
    return undefined;
  }
  const {
    positions
  } = mostRelevantTooltipConfiguration;
  if (positions == null) {
    return undefined;
  }
  // @ts-expect-error tooltipPayloadSearcher is not typed well
  const maybePosition = tooltipPayloadSearcher(positions, tooltipIndex);
  return maybePosition;
});
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keyboardEventsMiddleware = exports.keyDownAction = exports.focusAction = void 0;
const _toolkit = require("@reduxjs/toolkit");
const _tooltipSlice = require("./tooltipSlice");
const _tooltipSelectors = require("./selectors/tooltipSelectors");
const _selectors = require("./selectors/selectors");
const _axisSelectors = require("./selectors/axisSelectors");
const _combineActiveTooltipIndex = require("./selectors/combiners/combineActiveTooltipIndex");
const keyDownAction = exports.keyDownAction = (0, _toolkit.createAction)('keyDown');
const focusAction = exports.focusAction = (0, _toolkit.createAction)('focus');
const keyboardEventsMiddleware = exports.keyboardEventsMiddleware = (0, _toolkit.createListenerMiddleware)();
keyboardEventsMiddleware.startListening({
  actionCreator: keyDownAction,
  effect: (action, listenerApi) => {
    const state = listenerApi.getState();
    const accessibilityLayerIsActive = state.rootProps.accessibilityLayer !== false;
    if (!accessibilityLayerIsActive) {
      return;
    }
    const {
      keyboardInteraction
    } = state.tooltip;
    const key = action.payload;
    if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'Enter') {
      return;
    }

    // TODO this is lacking index for charts that do not support numeric indexes
    const currentIndex = Number((0, _combineActiveTooltipIndex.combineActiveTooltipIndex)(keyboardInteraction, (0, _tooltipSelectors.selectTooltipDisplayedData)(state)));
    const tooltipTicks = (0, _tooltipSelectors.selectTooltipAxisTicks)(state);
    if (key === 'Enter') {
      const _coordinate = (0, _selectors.selectCoordinateForDefaultIndex)(state, 'axis', 'hover', String(keyboardInteraction.index));
      listenerApi.dispatch((0, _tooltipSlice.setKeyboardInteraction)({
        active: !keyboardInteraction.active,
        activeIndex: keyboardInteraction.index,
        activeDataKey: keyboardInteraction.dataKey,
        activeCoordinate: _coordinate
      }));
      return;
    }
    const direction = (0, _axisSelectors.selectChartDirection)(state);
    const directionMultiplier = direction === 'left-to-right' ? 1 : -1;
    const movement = key === 'ArrowRight' ? 1 : -1;
    const nextIndex = currentIndex + movement * directionMultiplier;
    if (tooltipTicks == null || nextIndex >= tooltipTicks.length || nextIndex < 0) {
      return;
    }
    const coordinate = (0, _selectors.selectCoordinateForDefaultIndex)(state, 'axis', 'hover', String(nextIndex));
    listenerApi.dispatch((0, _tooltipSlice.setKeyboardInteraction)({
      active: true,
      activeIndex: nextIndex.toString(),
      activeDataKey: undefined,
      activeCoordinate: coordinate
    }));
  }
});
keyboardEventsMiddleware.startListening({
  actionCreator: focusAction,
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState();
    const accessibilityLayerIsActive = state.rootProps.accessibilityLayer !== false;
    if (!accessibilityLayerIsActive) {
      return;
    }
    const {
      keyboardInteraction
    } = state.tooltip;
    if (keyboardInteraction.active) {
      return;
    }
    if (keyboardInteraction.index == null) {
      const nextIndex = '0';
      const coordinate = (0, _selectors.selectCoordinateForDefaultIndex)(state, 'axis', 'hover', String(nextIndex));
      listenerApi.dispatch((0, _tooltipSlice.setKeyboardInteraction)({
        activeDataKey: undefined,
        active: true,
        activeIndex: nextIndex,
        activeCoordinate: coordinate
      }));
    }
  }
});
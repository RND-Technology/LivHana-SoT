"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.touchEventMiddleware = exports.touchEventAction = void 0;
const _toolkit = require("@reduxjs/toolkit");
const _tooltipSlice = require("./tooltipSlice");
const _selectActivePropsFromChartPointer = require("./selectors/selectActivePropsFromChartPointer");
const _getChartPointer = require("../util/getChartPointer");
const _selectTooltipEventType = require("./selectors/selectTooltipEventType");
const _Constants = require("../util/Constants");
const _touchSelectors = require("./selectors/touchSelectors");
const touchEventAction = exports.touchEventAction = (0, _toolkit.createAction)('touchMove');
const touchEventMiddleware = exports.touchEventMiddleware = (0, _toolkit.createListenerMiddleware)();
touchEventMiddleware.startListening({
  actionCreator: touchEventAction,
  effect: (action, listenerApi) => {
    const touchEvent = action.payload;
    const state = listenerApi.getState();
    const tooltipEventType = (0, _selectTooltipEventType.selectTooltipEventType)(state, state.tooltip.settings.shared);
    if (tooltipEventType === 'axis') {
      const activeProps = (0, _selectActivePropsFromChartPointer.selectActivePropsFromChartPointer)(state, (0, _getChartPointer.getChartPointer)({
        clientX: touchEvent.touches[0].clientX,
        clientY: touchEvent.touches[0].clientY,
        currentTarget: touchEvent.currentTarget
      }));
      if ((activeProps === null || activeProps === void 0 ? void 0 : activeProps.activeIndex) != null) {
        listenerApi.dispatch((0, _tooltipSlice.setMouseOverAxisIndex)({
          activeIndex: activeProps.activeIndex,
          activeDataKey: undefined,
          activeCoordinate: activeProps.activeCoordinate
        }));
      }
    } else if (tooltipEventType === 'item') {
      let _target$getAttribute;
      const touch = touchEvent.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!target || !target.getAttribute) {
        return;
      }
      const itemIndex = target.getAttribute(_Constants.DATA_ITEM_INDEX_ATTRIBUTE_NAME);
      const dataKey = (_target$getAttribute = target.getAttribute(_Constants.DATA_ITEM_DATAKEY_ATTRIBUTE_NAME)) !== null && _target$getAttribute !== void 0 ? _target$getAttribute : undefined;
      const coordinate = (0, _touchSelectors.selectTooltipCoordinate)(listenerApi.getState(), itemIndex, dataKey);
      listenerApi.dispatch((0, _tooltipSlice.setActiveMouseOverItemIndex)({
        activeDataKey: dataKey,
        activeIndex: itemIndex,
        activeCoordinate: coordinate
      }));
    }
  }
});
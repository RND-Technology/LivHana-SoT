"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useMouseLeaveItemDispatch = exports.useMouseEnterItemDispatch = exports.useMouseClickItemDispatch = void 0;
const _hooks = require("../state/hooks");
const _tooltipSlice = require("../state/tooltipSlice");
const useMouseEnterItemDispatch = (onMouseEnterFromProps, dataKey) => {
  const dispatch = (0, _hooks.useAppDispatch)();
  return (data, index) => event => {
    onMouseEnterFromProps === null || onMouseEnterFromProps === void 0 || onMouseEnterFromProps(data, index, event);
    dispatch((0, _tooltipSlice.setActiveMouseOverItemIndex)({
      activeIndex: String(index),
      activeDataKey: dataKey,
      activeCoordinate: data.tooltipPosition
    }));
  };
};
exports.useMouseEnterItemDispatch = useMouseEnterItemDispatch;
const useMouseLeaveItemDispatch = onMouseLeaveFromProps => {
  const dispatch = (0, _hooks.useAppDispatch)();
  return (data, index) => event => {
    onMouseLeaveFromProps === null || onMouseLeaveFromProps === void 0 || onMouseLeaveFromProps(data, index, event);
    dispatch((0, _tooltipSlice.mouseLeaveItem)());
  };
};
exports.useMouseLeaveItemDispatch = useMouseLeaveItemDispatch;
const useMouseClickItemDispatch = (onMouseClickFromProps, dataKey) => {
  const dispatch = (0, _hooks.useAppDispatch)();
  return (data, index) => event => {
    onMouseClickFromProps === null || onMouseClickFromProps === void 0 || onMouseClickFromProps(data, index, event);
    dispatch((0, _tooltipSlice.setActiveClickItemIndex)({
      activeIndex: String(index),
      activeDataKey: dataKey,
      activeCoordinate: data.tooltipPosition
    }));
  };
};
exports.useMouseClickItemDispatch = useMouseClickItemDispatch;
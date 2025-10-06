"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.combineTooltipEventType = combineTooltipEventType;
exports.selectDefaultTooltipEventType = void 0;
exports.selectTooltipEventType = selectTooltipEventType;
exports.selectValidateTooltipEventTypes = void 0;
exports.useTooltipEventType = useTooltipEventType;
const _hooks = require("../hooks");
const selectDefaultTooltipEventType = state => state.options.defaultTooltipEventType;
exports.selectDefaultTooltipEventType = selectDefaultTooltipEventType;
const selectValidateTooltipEventTypes = state => state.options.validateTooltipEventTypes;
exports.selectValidateTooltipEventTypes = selectValidateTooltipEventTypes;
function combineTooltipEventType(shared, defaultTooltipEventType, validateTooltipEventTypes) {
  if (shared == null) {
    return defaultTooltipEventType;
  }
  const eventType = shared ? 'axis' : 'item';
  if (validateTooltipEventTypes == null) {
    return defaultTooltipEventType;
  }
  return validateTooltipEventTypes.includes(eventType) ? eventType : defaultTooltipEventType;
}
function selectTooltipEventType(state, shared) {
  const defaultTooltipEventType = selectDefaultTooltipEventType(state);
  const validateTooltipEventTypes = selectValidateTooltipEventTypes(state);
  return combineTooltipEventType(shared, defaultTooltipEventType, validateTooltipEventTypes);
}
function useTooltipEventType(shared) {
  return (0, _hooks.useAppSelector)(state => selectTooltipEventType(state, shared));
}
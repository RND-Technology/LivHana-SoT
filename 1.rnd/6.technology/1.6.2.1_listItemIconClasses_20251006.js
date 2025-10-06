"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getListItemIconUtilityClass = getListItemIconUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getListItemIconUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiListItemIcon', slot);
}
const listItemIconClasses = (0, _generateUtilityClasses.default)('MuiListItemIcon', ['root', 'alignItemsFlexStart']);
const _default = exports.default = listItemIconClasses;
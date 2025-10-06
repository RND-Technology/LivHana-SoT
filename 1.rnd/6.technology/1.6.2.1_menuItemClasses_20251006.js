"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getMenuItemUtilityClass = getMenuItemUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getMenuItemUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiMenuItem', slot);
}
const menuItemClasses = (0, _generateUtilityClasses.default)('MuiMenuItem', ['root', 'focusVisible', 'dense', 'disabled', 'divider', 'gutters', 'selected']);
const _default = exports.default = menuItemClasses;
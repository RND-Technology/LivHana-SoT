"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getCheckboxUtilityClass = getCheckboxUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getCheckboxUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiCheckbox', slot);
}
const checkboxClasses = (0, _generateUtilityClasses.default)('MuiCheckbox', ['root', 'checked', 'disabled', 'indeterminate', 'colorPrimary', 'colorSecondary', 'sizeSmall', 'sizeMedium']);
const _default = exports.default = checkboxClasses;
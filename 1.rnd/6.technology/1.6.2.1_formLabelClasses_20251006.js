"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getFormLabelUtilityClasses = getFormLabelUtilityClasses;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getFormLabelUtilityClasses(slot) {
  return (0, _generateUtilityClass.default)('MuiFormLabel', slot);
}
const formLabelClasses = (0, _generateUtilityClasses.default)('MuiFormLabel', ['root', 'colorSecondary', 'focused', 'disabled', 'error', 'filled', 'required', 'asterisk']);
const _default = exports.default = formLabelClasses;
"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getFormGroupUtilityClass = getFormGroupUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getFormGroupUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiFormGroup', slot);
}
const formGroupClasses = (0, _generateUtilityClasses.default)('MuiFormGroup', ['root', 'row', 'error']);
const _default = exports.default = formGroupClasses;
"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getRadioUtilityClass = getRadioUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getRadioUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiRadio', slot);
}
const radioClasses = (0, _generateUtilityClasses.default)('MuiRadio', ['root', 'checked', 'disabled', 'colorPrimary', 'colorSecondary', 'sizeSmall']);
const _default = exports.default = radioClasses;
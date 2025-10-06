"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getButtonBaseUtilityClass = getButtonBaseUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getButtonBaseUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiButtonBase', slot);
}
const buttonBaseClasses = (0, _generateUtilityClasses.default)('MuiButtonBase', ['root', 'disabled', 'focusVisible']);
const _default = exports.default = buttonBaseClasses;
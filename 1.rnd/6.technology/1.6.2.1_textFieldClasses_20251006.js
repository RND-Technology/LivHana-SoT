"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getTextFieldUtilityClass = getTextFieldUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getTextFieldUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiTextField', slot);
}
const textFieldClasses = (0, _generateUtilityClasses.default)('MuiTextField', ['root']);
const _default = exports.default = textFieldClasses;
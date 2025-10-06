"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getPopperUtilityClass = getPopperUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getPopperUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiPopper', slot);
}
const popperClasses = (0, _generateUtilityClasses.default)('MuiPopper', ['root']);
const _default = exports.default = popperClasses;
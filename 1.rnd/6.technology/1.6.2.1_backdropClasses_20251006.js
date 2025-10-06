"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getBackdropUtilityClass = getBackdropUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getBackdropUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiBackdrop', slot);
}
const backdropClasses = (0, _generateUtilityClasses.default)('MuiBackdrop', ['root', 'invisible']);
const _default = exports.default = backdropClasses;
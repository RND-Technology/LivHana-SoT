"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getToolbarUtilityClass = getToolbarUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getToolbarUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiToolbar', slot);
}
const toolbarClasses = (0, _generateUtilityClasses.default)('MuiToolbar', ['root', 'gutters', 'regular', 'dense']);
const _default = exports.default = toolbarClasses;
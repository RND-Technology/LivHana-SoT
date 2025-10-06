"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getListSubheaderUtilityClass = getListSubheaderUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getListSubheaderUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiListSubheader', slot);
}
const listSubheaderClasses = (0, _generateUtilityClasses.default)('MuiListSubheader', ['root', 'colorPrimary', 'colorInherit', 'gutters', 'inset', 'sticky']);
const _default = exports.default = listSubheaderClasses;
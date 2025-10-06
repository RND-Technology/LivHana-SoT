"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getListItemTextUtilityClass = getListItemTextUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getListItemTextUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiListItemText', slot);
}
const listItemTextClasses = (0, _generateUtilityClasses.default)('MuiListItemText', ['root', 'multiline', 'dense', 'inset', 'primary', 'secondary']);
const _default = exports.default = listItemTextClasses;
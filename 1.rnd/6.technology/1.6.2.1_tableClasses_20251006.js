"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getTableUtilityClass = getTableUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getTableUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiTable', slot);
}
const tableClasses = (0, _generateUtilityClasses.default)('MuiTable', ['root', 'stickyHeader']);
const _default = exports.default = tableClasses;
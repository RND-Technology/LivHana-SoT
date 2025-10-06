"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getPaginationUtilityClass = getPaginationUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getPaginationUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiPagination', slot);
}
const paginationClasses = (0, _generateUtilityClasses.default)('MuiPagination', ['root', 'ul', 'outlined', 'text']);
const _default = exports.default = paginationClasses;
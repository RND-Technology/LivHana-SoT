"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getBottomNavigationUtilityClass = getBottomNavigationUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getBottomNavigationUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiBottomNavigation', slot);
}
const bottomNavigationClasses = (0, _generateUtilityClasses.default)('MuiBottomNavigation', ['root']);
const _default = exports.default = bottomNavigationClasses;
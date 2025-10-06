"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getAlertTitleUtilityClass = getAlertTitleUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getAlertTitleUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiAlertTitle', slot);
}
const alertTitleClasses = (0, _generateUtilityClasses.default)('MuiAlertTitle', ['root']);
const _default = exports.default = alertTitleClasses;
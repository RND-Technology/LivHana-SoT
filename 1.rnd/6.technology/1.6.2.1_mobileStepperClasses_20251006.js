"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getMobileStepperUtilityClass = getMobileStepperUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getMobileStepperUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiMobileStepper', slot);
}
const mobileStepperClasses = (0, _generateUtilityClasses.default)('MuiMobileStepper', ['root', 'positionBottom', 'positionTop', 'positionStatic', 'dots', 'dot', 'dotActive', 'progress']);
const _default = exports.default = mobileStepperClasses;
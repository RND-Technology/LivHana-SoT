"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getStepLabelUtilityClass = getStepLabelUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getStepLabelUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiStepLabel', slot);
}
const stepLabelClasses = (0, _generateUtilityClasses.default)('MuiStepLabel', ['root', 'horizontal', 'vertical', 'label', 'active', 'completed', 'error', 'disabled', 'iconContainer', 'alternativeLabel', 'labelContainer']);
const _default = exports.default = stepLabelClasses;
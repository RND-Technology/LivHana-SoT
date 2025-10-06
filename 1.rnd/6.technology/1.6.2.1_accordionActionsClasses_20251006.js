"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getAccordionActionsUtilityClass = getAccordionActionsUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getAccordionActionsUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiAccordionActions', slot);
}
const accordionActionsClasses = (0, _generateUtilityClasses.default)('MuiAccordionActions', ['root', 'spacing']);
const _default = exports.default = accordionActionsClasses;
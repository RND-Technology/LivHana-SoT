"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getCardActionsUtilityClass = getCardActionsUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getCardActionsUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiCardActions', slot);
}
const cardActionsClasses = (0, _generateUtilityClasses.default)('MuiCardActions', ['root', 'spacing']);
const _default = exports.default = cardActionsClasses;
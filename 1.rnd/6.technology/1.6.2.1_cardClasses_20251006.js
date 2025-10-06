"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getCardUtilityClass = getCardUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getCardUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiCard', slot);
}
const cardClasses = (0, _generateUtilityClasses.default)('MuiCard', ['root']);
const _default = exports.default = cardClasses;
"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getCardActionAreaUtilityClass = getCardActionAreaUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getCardActionAreaUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiCardActionArea', slot);
}
const cardActionAreaClasses = (0, _generateUtilityClasses.default)('MuiCardActionArea', ['root', 'focusVisible', 'focusHighlight']);
const _default = exports.default = cardActionAreaClasses;
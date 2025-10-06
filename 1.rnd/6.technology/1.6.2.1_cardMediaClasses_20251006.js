"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getCardMediaUtilityClass = getCardMediaUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getCardMediaUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiCardMedia', slot);
}
const cardMediaClasses = (0, _generateUtilityClasses.default)('MuiCardMedia', ['root', 'media', 'img']);
const _default = exports.default = cardMediaClasses;
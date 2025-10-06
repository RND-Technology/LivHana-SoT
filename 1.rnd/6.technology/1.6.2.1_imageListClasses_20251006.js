"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getImageListUtilityClass = getImageListUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getImageListUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiImageList', slot);
}
const imageListClasses = (0, _generateUtilityClasses.default)('MuiImageList', ['root', 'masonry', 'quilted', 'standard', 'woven']);
const _default = exports.default = imageListClasses;
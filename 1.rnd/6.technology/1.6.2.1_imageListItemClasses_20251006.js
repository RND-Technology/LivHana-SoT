"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getImageListItemUtilityClass = getImageListItemUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getImageListItemUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiImageListItem', slot);
}
const imageListItemClasses = (0, _generateUtilityClasses.default)('MuiImageListItem', ['root', 'img', 'standard', 'woven', 'masonry', 'quilted']);
const _default = exports.default = imageListItemClasses;
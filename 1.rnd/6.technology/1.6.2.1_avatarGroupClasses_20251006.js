"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getAvatarGroupUtilityClass = getAvatarGroupUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getAvatarGroupUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiAvatarGroup', slot);
}
const avatarGroupClasses = (0, _generateUtilityClasses.default)('MuiAvatarGroup', ['root', 'avatar']);
const _default = exports.default = avatarGroupClasses;
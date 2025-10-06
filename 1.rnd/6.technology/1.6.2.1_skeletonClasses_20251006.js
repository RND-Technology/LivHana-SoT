"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getSkeletonUtilityClass = getSkeletonUtilityClass;
const _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
function getSkeletonUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiSkeleton', slot);
}
const skeletonClasses = (0, _generateUtilityClasses.default)('MuiSkeleton', ['root', 'text', 'rectangular', 'rounded', 'circular', 'pulse', 'wave', 'withChildren', 'fitContent', 'heightAuto']);
const _default = exports.default = skeletonClasses;
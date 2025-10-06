"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const _isHostComponent = _interopRequireDefault(require("@mui/utils/isHostComponent"));
const shouldSpreadAdditionalProps = Slot => {
  return !Slot || !(0, _isHostComponent.default)(Slot);
};
const _default = exports.default = shouldSpreadAdditionalProps;
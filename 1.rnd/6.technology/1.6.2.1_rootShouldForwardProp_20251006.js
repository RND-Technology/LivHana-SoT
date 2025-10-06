"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const _slotShouldForwardProp = _interopRequireDefault(require("./slotShouldForwardProp"));
const rootShouldForwardProp = prop => (0, _slotShouldForwardProp.default)(prop) && prop !== 'classes';
const _default = exports.default = rootShouldForwardProp;
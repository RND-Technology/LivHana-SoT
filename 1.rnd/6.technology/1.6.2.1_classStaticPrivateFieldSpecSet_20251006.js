"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _classStaticPrivateFieldSpecSet;
const _classApplyDescriptorSet = require("classApplyDescriptorSet");
const _assertClassBrand = require("assertClassBrand");
const _classCheckPrivateStaticFieldDescriptor = require("classCheckPrivateStaticFieldDescriptor");
function _classStaticPrivateFieldSpecSet(receiver, classConstructor, descriptor, value) {
  _assertClassBrand(classConstructor, receiver);
  _classCheckPrivateStaticFieldDescriptor(descriptor, "set");
  _classApplyDescriptorSet(receiver, descriptor, value);
  return value;
}

//# sourceMappingURL=classStaticPrivateFieldSpecSet.js.map

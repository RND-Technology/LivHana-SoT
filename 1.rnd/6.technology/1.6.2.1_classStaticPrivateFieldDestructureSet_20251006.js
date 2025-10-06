"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _classStaticPrivateFieldDestructureSet;
const _classApplyDescriptorDestructureSet = require("classApplyDescriptorDestructureSet");
const _assertClassBrand = require("assertClassBrand");
const _classCheckPrivateStaticFieldDescriptor = require("classCheckPrivateStaticFieldDescriptor");
function _classStaticPrivateFieldDestructureSet(receiver, classConstructor, descriptor) {
  _assertClassBrand(classConstructor, receiver);
  _classCheckPrivateStaticFieldDescriptor(descriptor, "set");
  return _classApplyDescriptorDestructureSet(receiver, descriptor);
}

//# sourceMappingURL=classStaticPrivateFieldDestructureSet.js.map

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _classStaticPrivateFieldSpecGet;
const _classApplyDescriptorGet = require("classApplyDescriptorGet");
const _assertClassBrand = require("assertClassBrand");
const _classCheckPrivateStaticFieldDescriptor = require("classCheckPrivateStaticFieldDescriptor");
function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) {
  _assertClassBrand(classConstructor, receiver);
  _classCheckPrivateStaticFieldDescriptor(descriptor, "get");
  return _classApplyDescriptorGet(receiver, descriptor);
}

//# sourceMappingURL=classStaticPrivateFieldSpecGet.js.map

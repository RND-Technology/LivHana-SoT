"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _construct;
const _isNativeReflectConstruct = require("./isNativeReflectConstruct.js");
const _setPrototypeOf = require("./setPrototypeOf.js");
function _construct(Parent, args, Class) {
  if ((0, _isNativeReflectConstruct.default)()) {
    return Reflect.construct.apply(null, arguments);
  }
  const a = [null];
  a.push.apply(a, args);
  const instance = new (Parent.bind.apply(Parent, a))();
  if (Class) (0, _setPrototypeOf.default)(instance, Class.prototype);
  return instance;
}

//# sourceMappingURL=construct.js.map

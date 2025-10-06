"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _createSuper;
const _getPrototypeOf = require("getPrototypeOf");
const _isNativeReflectConstruct = require("isNativeReflectConstruct");
const _possibleConstructorReturn = require("possibleConstructorReturn");
function _createSuper(Derived) {
  const hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function _createSuperInternal() {
    let Super = _getPrototypeOf(Derived),
      result;
    if (hasNativeReflectConstruct) {
      const NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  };
}

//# sourceMappingURL=createSuper.js.map

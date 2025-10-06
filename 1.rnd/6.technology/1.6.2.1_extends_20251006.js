"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _extends;
function _extends() {
  exports.default = _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (let i = 1; i < arguments.length; i++) {
      const source = arguments[i];
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(null, arguments);
}

//# sourceMappingURL=extends.js.map

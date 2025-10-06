"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _objectWithoutPropertiesLoose;
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  const target = {};
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (excluded.indexOf(key) !== -1) continue;
      target[key] = source[key];
    }
  }
  return target;
}

//# sourceMappingURL=objectWithoutPropertiesLoose.js.map

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _wrapRegExp;
const _setPrototypeOf = require("./setPrototypeOf.js");
const _inherits = require("./inherits.js");
function _wrapRegExp() {
  exports.default = _wrapRegExp = function (re, groups) {
    return new BabelRegExp(re, undefined, groups);
  };
  const _super = RegExp.prototype;
  const _groups = new WeakMap();
  function BabelRegExp(re, flags, groups) {
    const _this = new RegExp(re, flags);
    _groups.set(_this, groups || _groups.get(re));
    return (0, _setPrototypeOf.default)(_this, BabelRegExp.prototype);
  }
  (0, _inherits.default)(BabelRegExp, RegExp);
  BabelRegExp.prototype.exec = function (str) {
    const result = _super.exec.call(this, str);
    if (result) {
      result.groups = buildGroups(result, this);
      const indices = result.indices;
      if (indices) indices.groups = buildGroups(indices, this);
    }
    return result;
  };
  BabelRegExp.prototype[Symbol.replace] = function (str, substitution) {
    if (typeof substitution === "string") {
      const groups = _groups.get(this);
      return _super[Symbol.replace].call(this, str, substitution.replace(/\$<([^>]+)(>|$)/g, function (match, name, end) {
        if (end === "") {
          return match;
        } else {
          const group = groups[name];
          return Array.isArray(group) ? "$" + group.join("$") : typeof group === "number" ? "$" + group : "";
        }
      }));
    } else if (typeof substitution === "function") {
      const _this = this;
      return _super[Symbol.replace].call(this, str, function () {
        let args = arguments;
        if (typeof args[args.length - 1] !== "object") {
          args = [].slice.call(args);
          args.push(buildGroups(args, _this));
        }
        return substitution.apply(this, args);
      });
    } else {
      return _super[Symbol.replace].call(this, str, substitution);
    }
  };
  function buildGroups(result, re) {
    const g = _groups.get(re);
    return Object.keys(g).reduce(function (groups, name) {
      const i = g[name];
      if (typeof i === "number") groups[name] = result[i];else {
        let k = 0;
        while (result[i[k]] === undefined && k + 1 < i.length) {
          k++;
        }
        groups[name] = result[i[k]];
      }
      return groups;
    }, Object.create(null));
  }
  return _wrapRegExp.apply(this, arguments);
}

//# sourceMappingURL=wrapRegExp.js.map

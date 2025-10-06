"use strict";
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __export = (target, all) => {
  for (const name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
const __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (const key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
const expectUtils_exports = {};
__export(expectUtils_exports, {
  serializeExpectedTextValues: () => serializeExpectedTextValues
});
module.exports = __toCommonJS(expectUtils_exports);
const import_rtti = require("../../utils/isomorphic/rtti");
function serializeExpectedTextValues(items, options = {}) {
  return items.map((i) => ({
    string: (0, import_rtti.isString)(i) ? i : void 0,
    regexSource: (0, import_rtti.isRegExp)(i) ? i.source : void 0,
    regexFlags: (0, import_rtti.isRegExp)(i) ? i.flags : void 0,
    matchSubstring: options.matchSubstring,
    ignoreCase: options.ignoreCase,
    normalizeWhiteSpace: options.normalizeWhiteSpace
  }));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  serializeExpectedTextValues
});

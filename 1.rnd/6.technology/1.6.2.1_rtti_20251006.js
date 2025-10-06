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
const rtti_exports = {};
__export(rtti_exports, {
  isError: () => isError,
  isObject: () => isObject,
  isRegExp: () => isRegExp,
  isString: () => import_stringUtils.isString
});
module.exports = __toCommonJS(rtti_exports);
var import_stringUtils = require("./stringUtils");
function isRegExp(obj) {
  return obj instanceof RegExp || Object.prototype.toString.call(obj) === "[object RegExp]";
}
function isObject(obj) {
  return typeof obj === "object" && obj !== null;
}
function isError(obj) {
  return obj instanceof Error || obj && Object.getPrototypeOf(obj)?.name === "Error";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isError,
  isObject,
  isRegExp,
  isString
});

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
const jestContext_exports = {};
__export(jestContext_exports, {
  jestConsoleContext: () => import_chunk_M5NKJZ76.jestConsoleContext,
  jestContext: () => import_chunk_M5NKJZ76.jestContext,
  jestProcessContext: () => import_chunk_M5NKJZ76.jestProcessContext
});
module.exports = __toCommonJS(jestContext_exports);
var import_chunk_M5NKJZ76 = require("../chunk-M5NKJZ76.js");
const import_chunk_2ESYSVXG = require("../chunk-2ESYSVXG.js");

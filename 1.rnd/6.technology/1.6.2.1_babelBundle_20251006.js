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
const babelBundle_exports = {};
__export(babelBundle_exports, {
  babelParse: () => babelParse,
  babelTransform: () => babelTransform,
  codeFrameColumns: () => codeFrameColumns,
  declare: () => declare,
  traverse: () => traverse,
  types: () => types
});
module.exports = __toCommonJS(babelBundle_exports);
const codeFrameColumns = require("./babelBundleImpl").codeFrameColumns;
const declare = require("./babelBundleImpl").declare;
const types = require("./babelBundleImpl").types;
const traverse = require("./babelBundleImpl").traverse;
const babelTransform = require("./babelBundleImpl").babelTransform;
const babelParse = require("./babelBundleImpl").babelParse;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  babelParse,
  babelTransform,
  codeFrameColumns,
  declare,
  traverse,
  types
});

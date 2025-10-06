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
const chunk_B23KD6U3_exports = {};
__export(chunk_B23KD6U3_exports, {
  binaryTargetRegex: () => binaryTargetRegex,
  binaryTargetRegex_exports: () => binaryTargetRegex_exports,
  init_binaryTargetRegex: () => init_binaryTargetRegex
});
module.exports = __toCommonJS(chunk_B23KD6U3_exports);
const import_chunk_7MLUNQIZ = require("./chunk-7MLUNQIZ.js");
const import_chunk_2ESYSVXG = require("./chunk-2ESYSVXG.js");
const require_escape_string_regexp = (0, import_chunk_2ESYSVXG.__commonJS)({
  "../../node_modules/.pnpm/escape-string-regexp@4.0.0/node_modules/escape-string-regexp/index.js"(exports, module2) {
    "use strict";
    module2.exports = (string) => {
      if (typeof string !== "string") {
        throw new TypeError("Expected a string");
      }
      return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
    };
  }
});
var binaryTargetRegex_exports = {};
(0, import_chunk_2ESYSVXG.__export)(binaryTargetRegex_exports, {
  binaryTargetRegex: () => binaryTargetRegex
});
let import_escape_string_regexp, binaryTargetRegex;
var init_binaryTargetRegex = (0, import_chunk_2ESYSVXG.__esm)({
  "src/test-utils/binaryTargetRegex.ts"() {
    import_escape_string_regexp = (0, import_chunk_2ESYSVXG.__toESM)(require_escape_string_regexp());
    (0, import_chunk_7MLUNQIZ.init_binaryTargets)();
    binaryTargetRegex = new RegExp(
      "(" + [...import_chunk_7MLUNQIZ.binaryTargets].sort((a, b) => b.length - a.length).map((p) => (0, import_escape_string_regexp.default)(p)).join("|") + ")",
      "g"
    );
  }
});

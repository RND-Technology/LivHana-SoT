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
const chunk_X37PZICB_exports = {};
__export(chunk_X37PZICB_exports, {
  BinaryType: () => BinaryType
});
module.exports = __toCommonJS(chunk_X37PZICB_exports);
var BinaryType = /* @__PURE__ */ ((BinaryType2) => {
  BinaryType2["QueryEngineBinary"] = "query-engine";
  BinaryType2["QueryEngineLibrary"] = "libquery-engine";
  BinaryType2["SchemaEngineBinary"] = "schema-engine";
  return BinaryType2;
})(BinaryType || {});

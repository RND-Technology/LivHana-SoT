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
const languages_exports = {};
__export(languages_exports, {
  languageSet: () => languageSet
});
module.exports = __toCommonJS(languages_exports);
const import_csharp = require("./csharp");
const import_java = require("./java");
const import_javascript = require("./javascript");
const import_jsonl = require("./jsonl");
const import_python = require("./python");
function languageSet() {
  return /* @__PURE__ */ new Set([
    new import_javascript.JavaScriptLanguageGenerator(
      /* isPlaywrightTest */
      true
    ),
    new import_javascript.JavaScriptLanguageGenerator(
      /* isPlaywrightTest */
      false
    ),
    new import_python.PythonLanguageGenerator(
      /* isAsync */
      false,
      /* isPytest */
      true
    ),
    new import_python.PythonLanguageGenerator(
      /* isAsync */
      false,
      /* isPytest */
      false
    ),
    new import_python.PythonLanguageGenerator(
      /* isAsync */
      true,
      /* isPytest */
      false
    ),
    new import_csharp.CSharpLanguageGenerator("mstest"),
    new import_csharp.CSharpLanguageGenerator("nunit"),
    new import_csharp.CSharpLanguageGenerator("library"),
    new import_java.JavaLanguageGenerator("junit"),
    new import_java.JavaLanguageGenerator("library"),
    new import_jsonl.JsonlLanguageGenerator()
  ]);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  languageSet
});

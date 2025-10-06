"use strict";
const __create = Object.create;
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __getProtoOf = Object.getPrototypeOf;
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
const __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
const pirates_exports = {};
__export(pirates_exports, {
  addHook: () => addHook
});
module.exports = __toCommonJS(pirates_exports);
const import_module = __toESM(require("module"));
const import_path = __toESM(require("path"));
function addHook(transformHook, shouldTransform, extensions) {
  const extensionsToOverwrite = extensions.filter((e) => e !== ".cjs");
  const allSupportedExtensions = new Set(extensions);
  const loaders = import_module.default._extensions;
  const jsLoader = loaders[".js"];
  for (const extension of extensionsToOverwrite) {
    const newLoader2 = function(mod, filename, ...loaderArgs) {
      if (allSupportedExtensions.has(import_path.default.extname(filename)) && shouldTransform(filename)) {
        const newCompile2 = function(code, file, ...ignoredArgs) {
          mod._compile = oldCompile;
          return oldCompile.call(this, transformHook(code, filename), file);
        };
        const newCompile = newCompile2;
        const oldCompile = mod._compile;
        mod._compile = newCompile2;
      }
      originalLoader.call(this, mod, filename, ...loaderArgs);
    };
    const newLoader = newLoader2;
    const originalLoader = loaders[extension] || jsLoader;
    loaders[extension] = newLoader2;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addHook
});

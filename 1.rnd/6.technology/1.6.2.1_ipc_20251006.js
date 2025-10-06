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
const ipc_exports = {};
__export(ipc_exports, {
  serializeConfig: () => serializeConfig,
  stdioChunkToParams: () => stdioChunkToParams
});
module.exports = __toCommonJS(ipc_exports);
const import_util = __toESM(require("util"));
const import_compilationCache = require("../transform/compilationCache");
function serializeConfig(config, passCompilationCache) {
  const result = {
    location: { configDir: config.configDir, resolvedConfigFile: config.config.configFile },
    configCLIOverrides: config.configCLIOverrides,
    compilationCache: passCompilationCache ? (0, import_compilationCache.serializeCompilationCache)() : void 0
  };
  try {
    result.metadata = JSON.stringify(config.config.metadata);
  } catch (error) {
  }
  return result;
}
function stdioChunkToParams(chunk) {
  if (chunk instanceof Uint8Array)
    return { buffer: Buffer.from(chunk).toString("base64") };
  if (typeof chunk !== "string")
    return { text: import_util.default.inspect(chunk) };
  return { text: chunk };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  serializeConfig,
  stdioChunkToParams
});

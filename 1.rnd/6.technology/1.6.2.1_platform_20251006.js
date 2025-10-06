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
const platform_exports = {};
__export(platform_exports, {
  emptyPlatform: () => emptyPlatform
});
module.exports = __toCommonJS(platform_exports);
const import_colors = require("../utils/isomorphic/colors");
const noopZone = {
  push: () => noopZone,
  pop: () => noopZone,
  run: (func) => func(),
  data: () => void 0
};
const emptyPlatform = {
  name: "empty",
  boxedStackPrefixes: () => [],
  calculateSha1: async () => {
    throw new Error("Not implemented");
  },
  colors: import_colors.webColors,
  createGuid: () => {
    throw new Error("Not implemented");
  },
  defaultMaxListeners: () => 10,
  env: {},
  fs: () => {
    throw new Error("Not implemented");
  },
  inspectCustom: void 0,
  isDebugMode: () => false,
  isJSDebuggerAttached: () => false,
  isLogEnabled(name) {
    return false;
  },
  isUnderTest: () => false,
  log(name, message) {
  },
  path: () => {
    throw new Error("Function not implemented.");
  },
  pathSeparator: "/",
  showInternalStackFrames: () => false,
  streamFile(path, writable) {
    throw new Error("Streams are not available");
  },
  streamReadable: (channel) => {
    throw new Error("Streams are not available");
  },
  streamWritable: (channel) => {
    throw new Error("Streams are not available");
  },
  zones: { empty: noopZone, current: () => noopZone }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  emptyPlatform
});

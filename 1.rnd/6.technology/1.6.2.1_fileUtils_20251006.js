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
const fileUtils_exports = {};
__export(fileUtils_exports, {
  fileUploadSizeLimit: () => fileUploadSizeLimit,
  mkdirIfNeeded: () => mkdirIfNeeded
});
module.exports = __toCommonJS(fileUtils_exports);
const fileUploadSizeLimit = 50 * 1024 * 1024;
async function mkdirIfNeeded(platform, filePath) {
  await platform.fs().promises.mkdir(platform.path().dirname(filePath), { recursive: true }).catch(() => {
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  fileUploadSizeLimit,
  mkdirIfNeeded
});

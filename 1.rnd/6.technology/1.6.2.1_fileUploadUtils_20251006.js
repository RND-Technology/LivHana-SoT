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
const fileUploadUtils_exports = {};
__export(fileUploadUtils_exports, {
  fileUploadSizeLimit: () => fileUploadSizeLimit,
  prepareFilesForUpload: () => prepareFilesForUpload
});
module.exports = __toCommonJS(fileUploadUtils_exports);
const import_fs = __toESM(require("fs"));
const import_path = __toESM(require("path"));
const import_assert = require("../utils/isomorphic/assert");
const import_utilsBundle = require("../utilsBundle");
const fileUploadSizeLimit = 50 * 1024 * 1024;
async function filesExceedUploadLimit(files) {
  const sizes = await Promise.all(files.map(async (file) => (await import_fs.default.promises.stat(file)).size));
  return sizes.reduce((total, size) => total + size, 0) >= fileUploadSizeLimit;
}
async function prepareFilesForUpload(frame, params) {
  const { payloads, streams, directoryStream } = params;
  let { localPaths, localDirectory } = params;
  if ([payloads, localPaths, localDirectory, streams, directoryStream].filter(Boolean).length !== 1)
    throw new Error("Exactly one of payloads, localPaths and streams must be provided");
  if (streams)
    localPaths = streams.map((c) => c.path());
  if (directoryStream)
    localDirectory = directoryStream.path();
  if (localPaths) {
    for (const p of localPaths)
      (0, import_assert.assert)(import_path.default.isAbsolute(p) && import_path.default.resolve(p) === p, "Paths provided to localPaths must be absolute and fully resolved.");
  }
  let fileBuffers = payloads;
  if (!frame._page.browserContext._browser._isCollocatedWithServer) {
    if (localPaths) {
      if (await filesExceedUploadLimit(localPaths))
        throw new Error("Cannot transfer files larger than 50Mb to a browser not co-located with the server");
      fileBuffers = await Promise.all(localPaths.map(async (item) => {
        return {
          name: import_path.default.basename(item),
          buffer: await import_fs.default.promises.readFile(item),
          lastModifiedMs: (await import_fs.default.promises.stat(item)).mtimeMs
        };
      }));
      localPaths = void 0;
    }
  }
  const filePayloads = fileBuffers?.map((payload) => ({
    name: payload.name,
    mimeType: payload.mimeType || import_utilsBundle.mime.getType(payload.name) || "application/octet-stream",
    buffer: payload.buffer.toString("base64"),
    lastModifiedMs: payload.lastModifiedMs
  }));
  return { localPaths, localDirectory, filePayloads };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  fileUploadSizeLimit,
  prepareFilesForUpload
});

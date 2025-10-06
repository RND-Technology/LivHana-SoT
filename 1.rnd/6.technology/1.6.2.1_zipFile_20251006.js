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
const zipFile_exports = {};
__export(zipFile_exports, {
  ZipFile: () => ZipFile
});
module.exports = __toCommonJS(zipFile_exports);
const import_zipBundle = require("../../zipBundle");
class ZipFile {
  constructor(fileName) {
    this._entries = /* @__PURE__ */ new Map();
    this._fileName = fileName;
    this._openedPromise = this._open();
  }
  async _open() {
    await new Promise((fulfill, reject) => {
      import_zipBundle.yauzl.open(this._fileName, { autoClose: false }, (e, z) => {
        if (e) {
          reject(e);
          return;
        }
        this._zipFile = z;
        this._zipFile.on("entry", (entry) => {
          this._entries.set(entry.fileName, entry);
        });
        this._zipFile.on("end", fulfill);
      });
    });
  }
  async entries() {
    await this._openedPromise;
    return [...this._entries.keys()];
  }
  async read(entryPath) {
    await this._openedPromise;
    const entry = this._entries.get(entryPath);
    if (!entry)
      throw new Error(`${entryPath} not found in file ${this._fileName}`);
    return new Promise((resolve, reject) => {
      this._zipFile.openReadStream(entry, (error, readStream) => {
        if (error || !readStream) {
          reject(error || "Entry not found");
          return;
        }
        const buffers = [];
        readStream.on("data", (data) => buffers.push(data));
        readStream.on("end", () => resolve(Buffer.concat(buffers)));
      });
    });
  }
  close() {
    this._zipFile?.close();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ZipFile
});

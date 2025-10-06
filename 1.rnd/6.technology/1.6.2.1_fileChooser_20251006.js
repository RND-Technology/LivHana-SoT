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
const fileChooser_exports = {};
__export(fileChooser_exports, {
  FileChooser: () => FileChooser
});
module.exports = __toCommonJS(fileChooser_exports);
class FileChooser {
  constructor(page, elementHandle, isMultiple) {
    this._page = page;
    this._elementHandle = elementHandle;
    this._isMultiple = isMultiple;
  }
  element() {
    return this._elementHandle;
  }
  isMultiple() {
    return this._isMultiple;
  }
  page() {
    return this._page;
  }
  async setFiles(files, options) {
    return await this._elementHandle.setInputFiles(files, options);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FileChooser
});

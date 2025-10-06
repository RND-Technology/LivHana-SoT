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
const webError_exports = {};
__export(webError_exports, {
  WebError: () => WebError
});
module.exports = __toCommonJS(webError_exports);
class WebError {
  constructor(page, error) {
    this._page = page;
    this._error = error;
  }
  page() {
    return this._page;
  }
  error() {
    return this._error;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WebError
});

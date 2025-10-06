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
const console_exports = {};
__export(console_exports, {
  ConsoleMessage: () => ConsoleMessage
});
module.exports = __toCommonJS(console_exports);
class ConsoleMessage {
  constructor(page, type, text, args, location) {
    this._page = page;
    this._type = type;
    this._text = text;
    this._args = args;
    this._location = location || { url: "", lineNumber: 0, columnNumber: 0 };
  }
  page() {
    return this._page;
  }
  type() {
    return this._type;
  }
  text() {
    if (this._text === void 0)
      this._text = this._args.map((arg) => arg.preview()).join(" ");
    return this._text;
  }
  args() {
    return this._args;
  }
  location() {
    return this._location;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConsoleMessage
});

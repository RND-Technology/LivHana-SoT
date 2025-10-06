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
const dialog_exports = {};
__export(dialog_exports, {
  Dialog: () => Dialog
});
module.exports = __toCommonJS(dialog_exports);
const import_channelOwner = require("./channelOwner");
const import_page = require("./page");
class Dialog extends import_channelOwner.ChannelOwner {
  static from(dialog) {
    return dialog._object;
  }
  constructor(parent, type, guid, initializer) {
    super(parent, type, guid, initializer);
    this._page = import_page.Page.fromNullable(initializer.page);
  }
  page() {
    return this._page;
  }
  type() {
    return this._initializer.type;
  }
  message() {
    return this._initializer.message;
  }
  defaultValue() {
    return this._initializer.defaultValue;
  }
  async accept(promptText) {
    await this._channel.accept({ promptText });
  }
  async dismiss() {
    await this._channel.dismiss();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Dialog
});

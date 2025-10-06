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
const dialogDispatcher_exports = {};
__export(dialogDispatcher_exports, {
  DialogDispatcher: () => DialogDispatcher
});
module.exports = __toCommonJS(dialogDispatcher_exports);
const import_dispatcher = require("./dispatcher");
const import_pageDispatcher = require("./pageDispatcher");
class DialogDispatcher extends import_dispatcher.Dispatcher {
  constructor(scope, dialog) {
    const page = import_pageDispatcher.PageDispatcher.fromNullable(scope, dialog.page().initializedOrUndefined());
    super(page || scope, dialog, "Dialog", {
      page,
      type: dialog.type(),
      message: dialog.message(),
      defaultValue: dialog.defaultValue()
    });
    this._type_Dialog = true;
  }
  async accept(params, progress) {
    await progress.race(this._object.accept(params.promptText));
  }
  async dismiss(params, progress) {
    await progress.race(this._object.dismiss());
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DialogDispatcher
});

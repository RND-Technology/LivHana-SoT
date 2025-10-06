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
const jsonPipeDispatcher_exports = {};
__export(jsonPipeDispatcher_exports, {
  JsonPipeDispatcher: () => JsonPipeDispatcher
});
module.exports = __toCommonJS(jsonPipeDispatcher_exports);
const import_dispatcher = require("./dispatcher");
const import_instrumentation = require("../instrumentation");
class JsonPipeDispatcher extends import_dispatcher.Dispatcher {
  constructor(scope) {
    super(scope, new import_instrumentation.SdkObject(scope._object, "jsonPipe"), "JsonPipe", {});
    this._type_JsonPipe = true;
  }
  async send(params, progress) {
    this.emit("message", params.message);
  }
  async close(params, progress) {
    this.emit("close");
    if (!this._disposed) {
      this._dispatchEvent("closed", {});
      this._dispose();
    }
  }
  dispatch(message) {
    if (!this._disposed)
      this._dispatchEvent("message", { message });
  }
  wasClosed(reason) {
    if (!this._disposed) {
      this._dispatchEvent("closed", { reason });
      this._dispose();
    }
  }
  dispose() {
    this._dispose();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  JsonPipeDispatcher
});

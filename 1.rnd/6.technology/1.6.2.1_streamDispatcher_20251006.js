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
const streamDispatcher_exports = {};
__export(streamDispatcher_exports, {
  StreamDispatcher: () => StreamDispatcher
});
module.exports = __toCommonJS(streamDispatcher_exports);
const import_dispatcher = require("./dispatcher");
const import_manualPromise = require("../../utils/isomorphic/manualPromise");
const import_instrumentation = require("../instrumentation");
class StreamSdkObject extends import_instrumentation.SdkObject {
  constructor(parent, stream) {
    super(parent, "stream");
    this.stream = stream;
  }
}
class StreamDispatcher extends import_dispatcher.Dispatcher {
  constructor(scope, stream) {
    super(scope, new StreamSdkObject(scope._object, stream), "Stream", {});
    this._type_Stream = true;
    this._ended = false;
    stream.once("end", () => this._ended = true);
    stream.once("error", () => this._ended = true);
  }
  async read(params, progress) {
    const stream = this._object.stream;
    if (this._ended)
      return { binary: Buffer.from("") };
    if (!stream.readableLength) {
      const readyPromise = new import_manualPromise.ManualPromise();
      const done = () => readyPromise.resolve();
      stream.on("readable", done);
      stream.on("end", done);
      stream.on("error", done);
      await progress.race(readyPromise).finally(() => {
        stream.off("readable", done);
        stream.off("end", done);
        stream.off("error", done);
      });
    }
    const buffer = stream.read(Math.min(stream.readableLength, params.size || stream.readableLength));
    return { binary: buffer || Buffer.from("") };
  }
  async close(params, progress) {
    this._object.stream.destroy();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StreamDispatcher
});

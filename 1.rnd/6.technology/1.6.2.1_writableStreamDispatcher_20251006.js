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
const writableStreamDispatcher_exports = {};
__export(writableStreamDispatcher_exports, {
  WritableStreamDispatcher: () => WritableStreamDispatcher
});
module.exports = __toCommonJS(writableStreamDispatcher_exports);
const import_fs = __toESM(require("fs"));
const import_dispatcher = require("./dispatcher");
const import_instrumentation = require("../instrumentation");
class WritableStreamSdkObject extends import_instrumentation.SdkObject {
  constructor(parent, streamOrDirectory, lastModifiedMs) {
    super(parent, "stream");
    this.streamOrDirectory = streamOrDirectory;
    this.lastModifiedMs = lastModifiedMs;
  }
}
class WritableStreamDispatcher extends import_dispatcher.Dispatcher {
  constructor(scope, streamOrDirectory, lastModifiedMs) {
    super(scope, new WritableStreamSdkObject(scope._object, streamOrDirectory, lastModifiedMs), "WritableStream", {});
    this._type_WritableStream = true;
  }
  async write(params, progress) {
    if (typeof this._object.streamOrDirectory === "string")
      throw new Error("Cannot write to a directory");
    const stream = this._object.streamOrDirectory;
    await progress.race(new Promise((fulfill, reject) => {
      stream.write(params.binary, (error) => {
        if (error)
          reject(error);
        else
          fulfill();
      });
    }));
  }
  async close(params, progress) {
    if (typeof this._object.streamOrDirectory === "string")
      throw new Error("Cannot close a directory");
    const stream = this._object.streamOrDirectory;
    await progress.race(new Promise((fulfill) => stream.end(fulfill)));
    if (this._object.lastModifiedMs)
      await progress.race(import_fs.default.promises.utimes(this.path(), new Date(this._object.lastModifiedMs), new Date(this._object.lastModifiedMs)));
  }
  path() {
    if (typeof this._object.streamOrDirectory === "string")
      return this._object.streamOrDirectory;
    return this._object.streamOrDirectory.path;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WritableStreamDispatcher
});

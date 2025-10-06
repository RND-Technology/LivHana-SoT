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
const pipeTransport_exports = {};
__export(pipeTransport_exports, {
  PipeTransport: () => PipeTransport
});
module.exports = __toCommonJS(pipeTransport_exports);
const import_utils = require("../utils");
const import_debugLogger = require("./utils/debugLogger");
class PipeTransport {
  constructor(pipeWrite, pipeRead) {
    this._pendingBuffers = [];
    this._waitForNextTask = (0, import_utils.makeWaitForNextTask)();
    this._closed = false;
    this._pipeRead = pipeRead;
    this._pipeWrite = pipeWrite;
    pipeRead.on("data", (buffer) => this._dispatch(buffer));
    pipeRead.on("close", () => {
      this._closed = true;
      if (this._onclose)
        this._onclose.call(null);
    });
    pipeRead.on("error", (e) => import_debugLogger.debugLogger.log("error", e));
    pipeWrite.on("error", (e) => import_debugLogger.debugLogger.log("error", e));
    this.onmessage = void 0;
  }
  get onclose() {
    return this._onclose;
  }
  set onclose(onclose) {
    this._onclose = onclose;
    if (onclose && !this._pipeRead.readable)
      onclose();
  }
  send(message) {
    if (this._closed)
      throw new Error("Pipe has been closed");
    this._pipeWrite.write(JSON.stringify(message));
    this._pipeWrite.write("\0");
  }
  close() {
    throw new Error("unimplemented");
  }
  _dispatch(buffer) {
    let end = buffer.indexOf("\0");
    if (end === -1) {
      this._pendingBuffers.push(buffer);
      return;
    }
    this._pendingBuffers.push(buffer.slice(0, end));
    const message = Buffer.concat(this._pendingBuffers).toString();
    this._waitForNextTask(() => {
      if (this.onmessage)
        this.onmessage.call(null, JSON.parse(message));
    });
    let start = end + 1;
    end = buffer.indexOf("\0", start);
    while (end !== -1) {
      const message2 = buffer.toString(void 0, start, end);
      this._waitForNextTask(() => {
        if (this.onmessage)
          this.onmessage.call(null, JSON.parse(message2));
      });
      start = end + 1;
      end = buffer.indexOf("\0", start);
    }
    this._pendingBuffers = [buffer.slice(start)];
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PipeTransport
});

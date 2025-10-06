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
const worker_exports = {};
__export(worker_exports, {
  Worker: () => Worker
});
module.exports = __toCommonJS(worker_exports);
const import_channelOwner = require("./channelOwner");
const import_errors = require("./errors");
const import_events = require("./events");
const import_jsHandle = require("./jsHandle");
const import_manualPromise = require("../utils/isomorphic/manualPromise");
class Worker extends import_channelOwner.ChannelOwner {
  constructor(parent, type, guid, initializer) {
    super(parent, type, guid, initializer);
    // Set for service workers.
    this._closedScope = new import_manualPromise.LongStandingScope();
    this._channel.on("close", () => {
      if (this._page)
        this._page._workers.delete(this);
      if (this._context)
        this._context._serviceWorkers.delete(this);
      this.emit(import_events.Events.Worker.Close, this);
    });
    this.once(import_events.Events.Worker.Close, () => this._closedScope.close(this._page?._closeErrorWithReason() || new import_errors.TargetClosedError()));
  }
  static from(worker) {
    return worker._object;
  }
  url() {
    return this._initializer.url;
  }
  async evaluate(pageFunction, arg) {
    (0, import_jsHandle.assertMaxArguments)(arguments.length, 2);
    const result = await this._channel.evaluateExpression({ expression: String(pageFunction), isFunction: typeof pageFunction === "function", arg: (0, import_jsHandle.serializeArgument)(arg) });
    return (0, import_jsHandle.parseResult)(result.value);
  }
  async evaluateHandle(pageFunction, arg) {
    (0, import_jsHandle.assertMaxArguments)(arguments.length, 2);
    const result = await this._channel.evaluateExpressionHandle({ expression: String(pageFunction), isFunction: typeof pageFunction === "function", arg: (0, import_jsHandle.serializeArgument)(arg) });
    return import_jsHandle.JSHandle.from(result.handle);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Worker
});

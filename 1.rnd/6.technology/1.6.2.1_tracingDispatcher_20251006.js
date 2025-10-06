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
const tracingDispatcher_exports = {};
__export(tracingDispatcher_exports, {
  TracingDispatcher: () => TracingDispatcher
});
module.exports = __toCommonJS(tracingDispatcher_exports);
const import_artifactDispatcher = require("./artifactDispatcher");
const import_dispatcher = require("./dispatcher");
class TracingDispatcher extends import_dispatcher.Dispatcher {
  constructor(scope, tracing) {
    super(scope, tracing, "Tracing", {});
    this._type_Tracing = true;
    this._started = false;
  }
  static from(scope, tracing) {
    const result = scope.connection.existingDispatcher(tracing);
    return result || new TracingDispatcher(scope, tracing);
  }
  async tracingStart(params, progress) {
    this._object.start(params);
    this._started = true;
  }
  async tracingStartChunk(params, progress) {
    return await this._object.startChunk(progress, params);
  }
  async tracingGroup(params, progress) {
    const { name, location } = params;
    this._object.group(name, location, progress.metadata);
  }
  async tracingGroupEnd(params, progress) {
    this._object.groupEnd();
  }
  async tracingStopChunk(params, progress) {
    const { artifact, entries } = await this._object.stopChunk(progress, params);
    return { artifact: artifact ? import_artifactDispatcher.ArtifactDispatcher.from(this, artifact) : void 0, entries };
  }
  async tracingStop(params, progress) {
    this._started = false;
    await this._object.stop(progress);
  }
  _onDispose() {
    if (this._started)
      this._object.stopChunk(void 0, { mode: "discard" }).then(() => this._object.stop(void 0)).catch(() => {
      });
    this._started = false;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TracingDispatcher
});

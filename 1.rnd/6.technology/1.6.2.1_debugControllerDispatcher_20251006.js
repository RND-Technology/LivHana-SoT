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
const debugControllerDispatcher_exports = {};
__export(debugControllerDispatcher_exports, {
  DebugControllerDispatcher: () => DebugControllerDispatcher
});
module.exports = __toCommonJS(debugControllerDispatcher_exports);
const import_utils = require("../../utils");
const import_debugController = require("../debugController");
const import_dispatcher = require("./dispatcher");
class DebugControllerDispatcher extends import_dispatcher.Dispatcher {
  constructor(connection, debugController) {
    super(connection, debugController, "DebugController", {});
    this._type_DebugController = true;
    this._listeners = [
      import_utils.eventsHelper.addEventListener(this._object, import_debugController.DebugController.Events.StateChanged, (params) => {
        this._dispatchEvent("stateChanged", params);
      }),
      import_utils.eventsHelper.addEventListener(this._object, import_debugController.DebugController.Events.InspectRequested, ({ selector, locator, ariaSnapshot }) => {
        this._dispatchEvent("inspectRequested", { selector, locator, ariaSnapshot });
      }),
      import_utils.eventsHelper.addEventListener(this._object, import_debugController.DebugController.Events.SourceChanged, ({ text, header, footer, actions }) => {
        this._dispatchEvent("sourceChanged", { text, header, footer, actions });
      }),
      import_utils.eventsHelper.addEventListener(this._object, import_debugController.DebugController.Events.Paused, ({ paused }) => {
        this._dispatchEvent("paused", { paused });
      }),
      import_utils.eventsHelper.addEventListener(this._object, import_debugController.DebugController.Events.SetModeRequested, ({ mode }) => {
        this._dispatchEvent("setModeRequested", { mode });
      })
    ];
  }
  async initialize(params, progress) {
    this._object.initialize(params.codegenId, params.sdkLanguage);
  }
  async setReportStateChanged(params, progress) {
    this._object.setReportStateChanged(params.enabled);
  }
  async setRecorderMode(params, progress) {
    await this._object.setRecorderMode(progress, params);
  }
  async highlight(params, progress) {
    await this._object.highlight(progress, params);
  }
  async hideHighlight(params, progress) {
    await this._object.hideHighlight(progress);
  }
  async resume(params, progress) {
    await this._object.resume(progress);
  }
  async kill(params, progress) {
    this._object.kill();
  }
  _onDispose() {
    import_utils.eventsHelper.removeEventListeners(this._listeners);
    this._object.dispose();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DebugControllerDispatcher
});

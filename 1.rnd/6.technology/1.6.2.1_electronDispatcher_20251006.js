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
const electronDispatcher_exports = {};
__export(electronDispatcher_exports, {
  ElectronApplicationDispatcher: () => ElectronApplicationDispatcher,
  ElectronDispatcher: () => ElectronDispatcher
});
module.exports = __toCommonJS(electronDispatcher_exports);
const import_browserContextDispatcher = require("./browserContextDispatcher");
const import_dispatcher = require("./dispatcher");
const import_jsHandleDispatcher = require("./jsHandleDispatcher");
const import_electron = require("../electron/electron");
class ElectronDispatcher extends import_dispatcher.Dispatcher {
  constructor(scope, electron, denyLaunch) {
    super(scope, electron, "Electron", {});
    this._type_Electron = true;
    this._denyLaunch = denyLaunch;
  }
  async launch(params, progress) {
    if (this._denyLaunch)
      throw new Error(`Launching more browsers is not allowed.`);
    const electronApplication = await this._object.launch(progress, params);
    return { electronApplication: new ElectronApplicationDispatcher(this, electronApplication) };
  }
}
class ElectronApplicationDispatcher extends import_dispatcher.Dispatcher {
  constructor(scope, electronApplication) {
    super(scope, electronApplication, "ElectronApplication", {
      context: import_browserContextDispatcher.BrowserContextDispatcher.from(scope, electronApplication.context())
    });
    this._type_EventTarget = true;
    this._type_ElectronApplication = true;
    this._subscriptions = /* @__PURE__ */ new Set();
    this.addObjectListener(import_electron.ElectronApplication.Events.Close, () => {
      this._dispatchEvent("close");
      this._dispose();
    });
    this.addObjectListener(import_electron.ElectronApplication.Events.Console, (message) => {
      if (!this._subscriptions.has("console"))
        return;
      this._dispatchEvent("console", {
        type: message.type(),
        text: message.text(),
        args: message.args().map((a) => import_jsHandleDispatcher.JSHandleDispatcher.fromJSHandle(this, a)),
        location: message.location()
      });
    });
  }
  async browserWindow(params, progress) {
    const handle = await progress.race(this._object.browserWindow(params.page.page()));
    return { handle: import_jsHandleDispatcher.JSHandleDispatcher.fromJSHandle(this, handle) };
  }
  async evaluateExpression(params, progress) {
    const handle = await progress.race(this._object._nodeElectronHandlePromise);
    return { value: (0, import_jsHandleDispatcher.serializeResult)(await progress.race(handle.evaluateExpression(params.expression, { isFunction: params.isFunction }, (0, import_jsHandleDispatcher.parseArgument)(params.arg)))) };
  }
  async evaluateExpressionHandle(params, progress) {
    const handle = await progress.race(this._object._nodeElectronHandlePromise);
    const result = await progress.race(handle.evaluateExpressionHandle(params.expression, { isFunction: params.isFunction }, (0, import_jsHandleDispatcher.parseArgument)(params.arg)));
    return { handle: import_jsHandleDispatcher.JSHandleDispatcher.fromJSHandle(this, result) };
  }
  async updateSubscription(params, progress) {
    if (params.enabled)
      this._subscriptions.add(params.event);
    else
      this._subscriptions.delete(params.event);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ElectronApplicationDispatcher,
  ElectronDispatcher
});

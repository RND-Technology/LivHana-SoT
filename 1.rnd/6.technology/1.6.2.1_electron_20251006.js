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
const electron_exports = {};
__export(electron_exports, {
  Electron: () => Electron,
  ElectronApplication: () => ElectronApplication
});
module.exports = __toCommonJS(electron_exports);
const import_browserContext = require("./browserContext");
const import_channelOwner = require("./channelOwner");
const import_clientHelper = require("./clientHelper");
const import_consoleMessage = require("./consoleMessage");
const import_errors = require("./errors");
const import_events = require("./events");
const import_jsHandle = require("./jsHandle");
const import_waiter = require("./waiter");
const import_timeoutSettings = require("./timeoutSettings");
class Electron extends import_channelOwner.ChannelOwner {
  static from(electron) {
    return electron._object;
  }
  constructor(parent, type, guid, initializer) {
    super(parent, type, guid, initializer);
  }
  async launch(options = {}) {
    options = this._playwright.selectors._withSelectorOptions(options);
    const params = {
      ...await (0, import_browserContext.prepareBrowserContextParams)(this._platform, options),
      env: (0, import_clientHelper.envObjectToArray)(options.env ? options.env : this._platform.env),
      tracesDir: options.tracesDir,
      timeout: new import_timeoutSettings.TimeoutSettings(this._platform).launchTimeout(options)
    };
    const app = ElectronApplication.from((await this._channel.launch(params)).electronApplication);
    this._playwright.selectors._contextsForSelectors.add(app._context);
    app.once(import_events.Events.ElectronApplication.Close, () => this._playwright.selectors._contextsForSelectors.delete(app._context));
    await app._context._initializeHarFromOptions(options.recordHar);
    app._context.tracing._tracesDir = options.tracesDir;
    return app;
  }
}
class ElectronApplication extends import_channelOwner.ChannelOwner {
  constructor(parent, type, guid, initializer) {
    super(parent, type, guid, initializer);
    this._windows = /* @__PURE__ */ new Set();
    this._timeoutSettings = new import_timeoutSettings.TimeoutSettings(this._platform);
    this._context = import_browserContext.BrowserContext.from(initializer.context);
    for (const page of this._context._pages)
      this._onPage(page);
    this._context.on(import_events.Events.BrowserContext.Page, (page) => this._onPage(page));
    this._channel.on("close", () => {
      this.emit(import_events.Events.ElectronApplication.Close);
    });
    this._channel.on("console", (event) => this.emit(import_events.Events.ElectronApplication.Console, new import_consoleMessage.ConsoleMessage(this._platform, event)));
    this._setEventToSubscriptionMapping(/* @__PURE__ */ new Map([
      [import_events.Events.ElectronApplication.Console, "console"]
    ]));
  }
  static from(electronApplication) {
    return electronApplication._object;
  }
  process() {
    return this._connection.toImpl?.(this)?.process();
  }
  _onPage(page) {
    this._windows.add(page);
    this.emit(import_events.Events.ElectronApplication.Window, page);
    page.once(import_events.Events.Page.Close, () => this._windows.delete(page));
  }
  windows() {
    return [...this._windows];
  }
  async firstWindow(options) {
    if (this._windows.size)
      return this._windows.values().next().value;
    return await this.waitForEvent("window", options);
  }
  context() {
    return this._context;
  }
  async [Symbol.asyncDispose]() {
    await this.close();
  }
  async close() {
    try {
      await this._context.close();
    } catch (e) {
      if ((0, import_errors.isTargetClosedError)(e))
        return;
      throw e;
    }
  }
  async waitForEvent(event, optionsOrPredicate = {}) {
    return await this._wrapApiCall(async () => {
      const timeout = this._timeoutSettings.timeout(typeof optionsOrPredicate === "function" ? {} : optionsOrPredicate);
      const predicate = typeof optionsOrPredicate === "function" ? optionsOrPredicate : optionsOrPredicate.predicate;
      const waiter = import_waiter.Waiter.createForEvent(this, event);
      waiter.rejectOnTimeout(timeout, `Timeout ${timeout}ms exceeded while waiting for event "${event}"`);
      if (event !== import_events.Events.ElectronApplication.Close)
        waiter.rejectOnEvent(this, import_events.Events.ElectronApplication.Close, () => new import_errors.TargetClosedError());
      const result = await waiter.waitForEvent(this, event, predicate);
      waiter.dispose();
      return result;
    });
  }
  async browserWindow(page) {
    const result = await this._channel.browserWindow({ page: page._channel });
    return import_jsHandle.JSHandle.from(result.handle);
  }
  async evaluate(pageFunction, arg) {
    const result = await this._channel.evaluateExpression({ expression: String(pageFunction), isFunction: typeof pageFunction === "function", arg: (0, import_jsHandle.serializeArgument)(arg) });
    return (0, import_jsHandle.parseResult)(result.value);
  }
  async evaluateHandle(pageFunction, arg) {
    const result = await this._channel.evaluateExpressionHandle({ expression: String(pageFunction), isFunction: typeof pageFunction === "function", arg: (0, import_jsHandle.serializeArgument)(arg) });
    return import_jsHandle.JSHandle.from(result.handle);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Electron,
  ElectronApplication
});

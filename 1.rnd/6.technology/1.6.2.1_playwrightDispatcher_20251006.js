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
const playwrightDispatcher_exports = {};
__export(playwrightDispatcher_exports, {
  PlaywrightDispatcher: () => PlaywrightDispatcher
});
module.exports = __toCommonJS(playwrightDispatcher_exports);
const import_socksProxy = require("../utils/socksProxy");
const import_fetch = require("../fetch");
const import_androidDispatcher = require("./androidDispatcher");
const import_androidDispatcher2 = require("./androidDispatcher");
const import_browserDispatcher = require("./browserDispatcher");
const import_browserTypeDispatcher = require("./browserTypeDispatcher");
const import_dispatcher = require("./dispatcher");
const import_electronDispatcher = require("./electronDispatcher");
const import_localUtilsDispatcher = require("./localUtilsDispatcher");
const import_networkDispatchers = require("./networkDispatchers");
const import_instrumentation = require("../instrumentation");
const import_eventsHelper = require("../utils/eventsHelper");
class PlaywrightDispatcher extends import_dispatcher.Dispatcher {
  constructor(scope, playwright, options = {}) {
    const denyLaunch = options.denyLaunch ?? false;
    const chromium = new import_browserTypeDispatcher.BrowserTypeDispatcher(scope, playwright.chromium, denyLaunch);
    const firefox = new import_browserTypeDispatcher.BrowserTypeDispatcher(scope, playwright.firefox, denyLaunch);
    const webkit = new import_browserTypeDispatcher.BrowserTypeDispatcher(scope, playwright.webkit, denyLaunch);
    const _bidiChromium = new import_browserTypeDispatcher.BrowserTypeDispatcher(scope, playwright._bidiChromium, denyLaunch);
    const _bidiFirefox = new import_browserTypeDispatcher.BrowserTypeDispatcher(scope, playwright._bidiFirefox, denyLaunch);
    const android = new import_androidDispatcher.AndroidDispatcher(scope, playwright.android);
    const initializer = {
      chromium,
      firefox,
      webkit,
      _bidiChromium,
      _bidiFirefox,
      android,
      electron: new import_electronDispatcher.ElectronDispatcher(scope, playwright.electron, denyLaunch),
      utils: playwright.options.isServer ? void 0 : new import_localUtilsDispatcher.LocalUtilsDispatcher(scope, playwright),
      socksSupport: options.socksProxy ? new SocksSupportDispatcher(scope, playwright, options.socksProxy) : void 0
    };
    let browserDispatcher;
    if (options.preLaunchedBrowser) {
      const browserTypeDispatcher = initializer[options.preLaunchedBrowser.options.name];
      browserDispatcher = new import_browserDispatcher.BrowserDispatcher(browserTypeDispatcher, options.preLaunchedBrowser, {
        ignoreStopAndKill: true,
        isolateContexts: !options.sharedBrowser
      });
      initializer.preLaunchedBrowser = browserDispatcher;
    }
    if (options.preLaunchedAndroidDevice)
      initializer.preConnectedAndroidDevice = new import_androidDispatcher2.AndroidDeviceDispatcher(android, options.preLaunchedAndroidDevice);
    super(scope, playwright, "Playwright", initializer);
    this._type_Playwright = true;
    this._browserDispatcher = browserDispatcher;
  }
  async newRequest(params, progress) {
    const request = new import_fetch.GlobalAPIRequestContext(this._object, params);
    return { request: import_networkDispatchers.APIRequestContextDispatcher.from(this.parentScope(), request) };
  }
  async cleanup() {
    await this._browserDispatcher?.cleanupContexts();
  }
}
class SocksSupportDispatcher extends import_dispatcher.Dispatcher {
  constructor(scope, parent, socksProxy) {
    super(scope, new import_instrumentation.SdkObject(parent, "socksSupport"), "SocksSupport", {});
    this._type_SocksSupport = true;
    this._socksProxy = socksProxy;
    this._socksListeners = [
      import_eventsHelper.eventsHelper.addEventListener(socksProxy, import_socksProxy.SocksProxy.Events.SocksRequested, (payload) => this._dispatchEvent("socksRequested", payload)),
      import_eventsHelper.eventsHelper.addEventListener(socksProxy, import_socksProxy.SocksProxy.Events.SocksData, (payload) => this._dispatchEvent("socksData", payload)),
      import_eventsHelper.eventsHelper.addEventListener(socksProxy, import_socksProxy.SocksProxy.Events.SocksClosed, (payload) => this._dispatchEvent("socksClosed", payload))
    ];
  }
  async socksConnected(params, progress) {
    this._socksProxy?.socketConnected(params);
  }
  async socksFailed(params, progress) {
    this._socksProxy?.socketFailed(params);
  }
  async socksData(params, progress) {
    this._socksProxy?.sendSocketData(params);
  }
  async socksError(params, progress) {
    this._socksProxy?.sendSocketError(params);
  }
  async socksEnd(params, progress) {
    this._socksProxy?.sendSocketEnd(params);
  }
  _onDispose() {
    import_eventsHelper.eventsHelper.removeEventListeners(this._socksListeners);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PlaywrightDispatcher
});

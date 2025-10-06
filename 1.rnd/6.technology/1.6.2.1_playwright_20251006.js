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
const playwright_exports = {};
__export(playwright_exports, {
  Playwright: () => Playwright
});
module.exports = __toCommonJS(playwright_exports);
const import_android = require("./android");
const import_browser = require("./browser");
const import_browserType = require("./browserType");
const import_channelOwner = require("./channelOwner");
const import_electron = require("./electron");
const import_errors = require("./errors");
const import_fetch = require("./fetch");
const import_selectors = require("./selectors");
class Playwright extends import_channelOwner.ChannelOwner {
  constructor(parent, type, guid, initializer) {
    super(parent, type, guid, initializer);
    this.request = new import_fetch.APIRequest(this);
    this.chromium = import_browserType.BrowserType.from(initializer.chromium);
    this.chromium._playwright = this;
    this.firefox = import_browserType.BrowserType.from(initializer.firefox);
    this.firefox._playwright = this;
    this.webkit = import_browserType.BrowserType.from(initializer.webkit);
    this.webkit._playwright = this;
    this._android = import_android.Android.from(initializer.android);
    this._android._playwright = this;
    this._electron = import_electron.Electron.from(initializer.electron);
    this._electron._playwright = this;
    this._bidiChromium = import_browserType.BrowserType.from(initializer._bidiChromium);
    this._bidiChromium._playwright = this;
    this._bidiFirefox = import_browserType.BrowserType.from(initializer._bidiFirefox);
    this._bidiFirefox._playwright = this;
    this.devices = this._connection.localUtils()?.devices ?? {};
    this.selectors = new import_selectors.Selectors(this._connection._platform);
    this.errors = { TimeoutError: import_errors.TimeoutError };
  }
  static from(channel) {
    return channel._object;
  }
  _browserTypes() {
    return [this.chromium, this.firefox, this.webkit, this._bidiChromium, this._bidiFirefox];
  }
  _preLaunchedBrowser() {
    const browser = import_browser.Browser.from(this._initializer.preLaunchedBrowser);
    browser._connectToBrowserType(this[browser._name], {}, void 0);
    return browser;
  }
  _allContexts() {
    return this._browserTypes().flatMap((type) => [...type._contexts]);
  }
  _allPages() {
    return this._allContexts().flatMap((context) => context.pages());
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Playwright
});

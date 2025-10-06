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
const timeoutSettings_exports = {};
__export(timeoutSettings_exports, {
  TimeoutSettings: () => TimeoutSettings
});
module.exports = __toCommonJS(timeoutSettings_exports);
const import_time = require("../utils/isomorphic/time");
class TimeoutSettings {
  constructor(platform, parent) {
    this._parent = parent;
    this._platform = platform;
  }
  setDefaultTimeout(timeout) {
    this._defaultTimeout = timeout;
  }
  setDefaultNavigationTimeout(timeout) {
    this._defaultNavigationTimeout = timeout;
  }
  defaultNavigationTimeout() {
    return this._defaultNavigationTimeout;
  }
  defaultTimeout() {
    return this._defaultTimeout;
  }
  navigationTimeout(options) {
    if (typeof options.timeout === "number")
      return options.timeout;
    if (this._defaultNavigationTimeout !== void 0)
      return this._defaultNavigationTimeout;
    if (this._platform.isDebugMode())
      return 0;
    if (this._defaultTimeout !== void 0)
      return this._defaultTimeout;
    if (this._parent)
      return this._parent.navigationTimeout(options);
    return import_time.DEFAULT_PLAYWRIGHT_TIMEOUT;
  }
  timeout(options) {
    if (typeof options.timeout === "number")
      return options.timeout;
    if (this._platform.isDebugMode())
      return 0;
    if (this._defaultTimeout !== void 0)
      return this._defaultTimeout;
    if (this._parent)
      return this._parent.timeout(options);
    return import_time.DEFAULT_PLAYWRIGHT_TIMEOUT;
  }
  launchTimeout(options) {
    if (typeof options.timeout === "number")
      return options.timeout;
    if (this._platform.isDebugMode())
      return 0;
    if (this._parent)
      return this._parent.launchTimeout(options);
    return import_time.DEFAULT_PLAYWRIGHT_LAUNCH_TIMEOUT;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TimeoutSettings
});

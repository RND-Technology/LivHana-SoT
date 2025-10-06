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
const coverage_exports = {};
__export(coverage_exports, {
  Coverage: () => Coverage
});
module.exports = __toCommonJS(coverage_exports);
class Coverage {
  constructor(channel) {
    this._channel = channel;
  }
  async startJSCoverage(options = {}) {
    await this._channel.startJSCoverage(options);
  }
  async stopJSCoverage() {
    return (await this._channel.stopJSCoverage()).entries;
  }
  async startCSSCoverage(options = {}) {
    await this._channel.startCSSCoverage(options);
  }
  async stopCSSCoverage() {
    return (await this._channel.stopCSSCoverage()).entries;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Coverage
});

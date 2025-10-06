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
const selectors_exports = {};
__export(selectors_exports, {
  Selectors: () => Selectors
});
module.exports = __toCommonJS(selectors_exports);
const import_clientHelper = require("./clientHelper");
const import_locator = require("./locator");
class Selectors {
  constructor(platform) {
    this._selectorEngines = [];
    this._contextsForSelectors = /* @__PURE__ */ new Set();
    this._platform = platform;
  }
  async register(name, script, options = {}) {
    if (this._selectorEngines.some((engine) => engine.name === name))
      throw new Error(`selectors.register: "${name}" selector engine has been already registered`);
    const source = await (0, import_clientHelper.evaluationScript)(this._platform, script, void 0, false);
    const selectorEngine = { ...options, name, source };
    for (const context of this._contextsForSelectors)
      await context._channel.registerSelectorEngine({ selectorEngine });
    this._selectorEngines.push(selectorEngine);
  }
  setTestIdAttribute(attributeName) {
    this._testIdAttributeName = attributeName;
    (0, import_locator.setTestIdAttribute)(attributeName);
    for (const context of this._contextsForSelectors)
      context._channel.setTestIdAttributeName({ testIdAttributeName: attributeName }).catch(() => {
      });
  }
  _withSelectorOptions(options) {
    return { ...options, selectorEngines: this._selectorEngines, testIdAttributeName: this._testIdAttributeName };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Selectors
});

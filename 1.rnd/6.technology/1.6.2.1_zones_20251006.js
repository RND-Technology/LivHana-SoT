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
const zones_exports = {};
__export(zones_exports, {
  Zone: () => Zone,
  currentZone: () => currentZone,
  emptyZone: () => emptyZone
});
module.exports = __toCommonJS(zones_exports);
const import_async_hooks = require("async_hooks");
const asyncLocalStorage = new import_async_hooks.AsyncLocalStorage();
class Zone {
  constructor(asyncLocalStorage2, store) {
    this._asyncLocalStorage = asyncLocalStorage2;
    this._data = store;
  }
  with(type, data) {
    return new Zone(this._asyncLocalStorage, new Map(this._data).set(type, data));
  }
  without(type) {
    const data = type ? new Map(this._data) : /* @__PURE__ */ new Map();
    data.delete(type);
    return new Zone(this._asyncLocalStorage, data);
  }
  run(func) {
    return this._asyncLocalStorage.run(this, func);
  }
  data(type) {
    return this._data.get(type);
  }
}
const emptyZone = new Zone(asyncLocalStorage, /* @__PURE__ */ new Map());
function currentZone() {
  return asyncLocalStorage.getStore() ?? emptyZone;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Zone,
  currentZone,
  emptyZone
});

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
const multimap_exports = {};
__export(multimap_exports, {
  MultiMap: () => MultiMap
});
module.exports = __toCommonJS(multimap_exports);
class MultiMap {
  constructor() {
    this._map = /* @__PURE__ */ new Map();
  }
  set(key, value) {
    let values = this._map.get(key);
    if (!values) {
      values = [];
      this._map.set(key, values);
    }
    values.push(value);
  }
  get(key) {
    return this._map.get(key) || [];
  }
  has(key) {
    return this._map.has(key);
  }
  delete(key, value) {
    const values = this._map.get(key);
    if (!values)
      return;
    if (values.includes(value))
      this._map.set(key, values.filter((v) => value !== v));
  }
  deleteAll(key) {
    this._map.delete(key);
  }
  hasValue(key, value) {
    const values = this._map.get(key);
    if (!values)
      return false;
    return values.includes(value);
  }
  get size() {
    return this._map.size;
  }
  [Symbol.iterator]() {
    return this._map[Symbol.iterator]();
  }
  keys() {
    return this._map.keys();
  }
  values() {
    const result = [];
    for (const key of this.keys())
      result.push(...this.get(key));
    return result;
  }
  clear() {
    this._map.clear();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MultiMap
});

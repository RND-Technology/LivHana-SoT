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
const clientInstrumentation_exports = {};
__export(clientInstrumentation_exports, {
  createInstrumentation: () => createInstrumentation
});
module.exports = __toCommonJS(clientInstrumentation_exports);
function createInstrumentation() {
  const listeners = [];
  return new Proxy({}, {
    get: (obj, prop) => {
      if (typeof prop !== "string")
        return obj[prop];
      if (prop === "addListener")
        return (listener) => listeners.push(listener);
      if (prop === "removeListener")
        return (listener) => listeners.splice(listeners.indexOf(listener), 1);
      if (prop === "removeAllListeners")
        return () => listeners.splice(0, listeners.length);
      if (prop.startsWith("run")) {
        return async (...params) => {
          for (const listener of listeners)
            await listener[prop]?.(...params);
        };
      }
      if (prop.startsWith("on")) {
        return (...params) => {
          for (const listener of listeners)
            listener[prop]?.(...params);
        };
      }
      return obj[prop];
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createInstrumentation
});

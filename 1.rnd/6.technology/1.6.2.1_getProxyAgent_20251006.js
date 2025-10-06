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
const getProxyAgent_exports = {};
__export(getProxyAgent_exports, {
  getProxyAgent: () => import_chunk_KDPLGCY6.getProxyAgent
});
module.exports = __toCommonJS(getProxyAgent_exports);
var import_chunk_KDPLGCY6 = require("./chunk-KDPLGCY6.js");
const import_chunk_AH6QHEOA = require("./chunk-AH6QHEOA.js");

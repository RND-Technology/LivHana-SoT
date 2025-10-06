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
const getPlatform_exports = {};
__export(getPlatform_exports, {
  computeLibSSLSpecificPaths: () => import_chunk_YDM7ULQH.computeLibSSLSpecificPaths,
  getArchFromUname: () => import_chunk_YDM7ULQH.getArchFromUname,
  getBinaryTargetForCurrentPlatform: () => import_chunk_YDM7ULQH.getBinaryTargetForCurrentPlatform,
  getBinaryTargetForCurrentPlatformInternal: () => import_chunk_YDM7ULQH.getBinaryTargetForCurrentPlatformInternal,
  getPlatformInfo: () => import_chunk_YDM7ULQH.getPlatformInfo,
  getPlatformInfoMemoized: () => import_chunk_YDM7ULQH.getPlatformInfoMemoized,
  getSSLVersion: () => import_chunk_YDM7ULQH.getSSLVersion,
  getos: () => import_chunk_YDM7ULQH.getos,
  parseDistro: () => import_chunk_YDM7ULQH.parseDistro,
  parseLibSSLVersion: () => import_chunk_YDM7ULQH.parseLibSSLVersion,
  parseOpenSSLVersion: () => import_chunk_YDM7ULQH.parseOpenSSLVersion,
  resolveDistro: () => import_chunk_YDM7ULQH.resolveDistro
});
module.exports = __toCommonJS(getPlatform_exports);
var import_chunk_YDM7ULQH = require("./chunk-YDM7ULQH.js");
const import_chunk_FWMN4WME = require("./chunk-FWMN4WME.js");
const import_chunk_YVXCXD3A = require("./chunk-YVXCXD3A.js");
const import_chunk_2ESYSVXG = require("./chunk-2ESYSVXG.js");

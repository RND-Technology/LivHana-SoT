"use strict";
const __create = Object.create;
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __getProtoOf = Object.getPrototypeOf;
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
const __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
const chunk_QSTZGX47_exports = {};
__export(chunk_QSTZGX47_exports, {
  cleanupCache: () => cleanupCache
});
module.exports = __toCommonJS(chunk_QSTZGX47_exports);
const import_chunk_RGVHWUUH = require("./chunk-RGVHWUUH.js");
const import_chunk_FQ2BOR66 = require("./chunk-FQ2BOR66.js");
const import_chunk_AH6QHEOA = require("./chunk-AH6QHEOA.js");
const import_debug = __toESM(require("@prisma/debug"));
const import_fs = __toESM(require("fs"));
const import_path = __toESM(require("path"));
const import_util = require("util");
const import_p_map = (0, import_chunk_AH6QHEOA.__toESM)((0, import_chunk_RGVHWUUH.require_p_map)());
const import_rimraf = (0, import_chunk_AH6QHEOA.__toESM)((0, import_chunk_RGVHWUUH.require_rimraf)());
const debug = (0, import_debug.default)("cleanupCache");
const del = (0, import_util.promisify)(import_rimraf.default);
async function cleanupCache(n = 5) {
  try {
    const rootCacheDir = await (0, import_chunk_FQ2BOR66.getRootCacheDir)();
    if (!rootCacheDir) {
      debug("no rootCacheDir found");
      return;
    }
    const channel = "master";
    const cacheDir = import_path.default.join(rootCacheDir, channel);
    const dirs = await import_fs.default.promises.readdir(cacheDir);
    const dirsWithMeta = await Promise.all(
      dirs.map(async (dirName) => {
        const dir = import_path.default.join(cacheDir, dirName);
        const statResult = await import_fs.default.promises.stat(dir);
        return {
          dir,
          created: statResult.birthtime
        };
      })
    );
    dirsWithMeta.sort((a, b) => a.created < b.created ? 1 : -1);
    const dirsToRemove = dirsWithMeta.slice(n);
    await (0, import_p_map.default)(dirsToRemove, (dir) => del(dir.dir), { concurrency: 20 });
  } catch (e) {
  }
}

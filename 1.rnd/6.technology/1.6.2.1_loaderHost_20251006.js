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
const loaderHost_exports = {};
__export(loaderHost_exports, {
  InProcessLoaderHost: () => InProcessLoaderHost,
  OutOfProcessLoaderHost: () => OutOfProcessLoaderHost
});
module.exports = __toCommonJS(loaderHost_exports);
const import_processHost = require("./processHost");
const import_esmLoaderHost = require("../common/esmLoaderHost");
const import_ipc = require("../common/ipc");
const import_poolBuilder = require("../common/poolBuilder");
const import_test = require("../common/test");
const import_testLoader = require("../common/testLoader");
const import_compilationCache = require("../transform/compilationCache");
class InProcessLoaderHost {
  constructor(config) {
    this._config = config;
    this._poolBuilder = import_poolBuilder.PoolBuilder.createForLoader();
  }
  async start(errors) {
    return true;
  }
  async loadTestFile(file, testErrors) {
    const result = await (0, import_testLoader.loadTestFile)(file, this._config.config.rootDir, testErrors);
    this._poolBuilder.buildPools(result, testErrors);
    return result;
  }
  async stop() {
    await (0, import_esmLoaderHost.incorporateCompilationCache)();
  }
}
class OutOfProcessLoaderHost {
  constructor(config) {
    this._config = config;
    this._processHost = new import_processHost.ProcessHost(require.resolve("../loader/loaderMain.js"), "loader", {});
  }
  async start(errors) {
    const startError = await this._processHost.startRunner((0, import_ipc.serializeConfig)(this._config, false));
    if (startError) {
      errors.push({
        message: `Test loader process failed to start with code "${startError.code}" and signal "${startError.signal}"`
      });
      return false;
    }
    return true;
  }
  async loadTestFile(file, testErrors) {
    const result = await this._processHost.sendMessage({ method: "loadTestFile", params: { file } });
    testErrors.push(...result.testErrors);
    return import_test.Suite._deepParse(result.fileSuite);
  }
  async stop() {
    const result = await this._processHost.sendMessage({ method: "getCompilationCacheFromLoader" });
    (0, import_compilationCache.addToCompilationCache)(result);
    await this._processHost.stop();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InProcessLoaderHost,
  OutOfProcessLoaderHost
});

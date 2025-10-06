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
const loaderMain_exports = {};
__export(loaderMain_exports, {
  LoaderMain: () => LoaderMain,
  create: () => create
});
module.exports = __toCommonJS(loaderMain_exports);
const import_configLoader = require("../common/configLoader");
const import_esmLoaderHost = require("../common/esmLoaderHost");
const import_poolBuilder = require("../common/poolBuilder");
const import_process = require("../common/process");
const import_testLoader = require("../common/testLoader");
const import_compilationCache = require("../transform/compilationCache");
class LoaderMain extends import_process.ProcessRunner {
  constructor(serializedConfig) {
    super();
    this._poolBuilder = import_poolBuilder.PoolBuilder.createForLoader();
    this._serializedConfig = serializedConfig;
  }
  _config() {
    if (!this._configPromise)
      this._configPromise = (0, import_configLoader.deserializeConfig)(this._serializedConfig);
    return this._configPromise;
  }
  async loadTestFile(params) {
    const testErrors = [];
    const config = await this._config();
    const fileSuite = await (0, import_testLoader.loadTestFile)(params.file, config.config.rootDir, testErrors);
    this._poolBuilder.buildPools(fileSuite);
    return { fileSuite: fileSuite._deepSerialize(), testErrors };
  }
  async getCompilationCacheFromLoader() {
    await (0, import_esmLoaderHost.incorporateCompilationCache)();
    return (0, import_compilationCache.serializeCompilationCache)();
  }
}
const create = (config) => new LoaderMain(config);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LoaderMain,
  create
});

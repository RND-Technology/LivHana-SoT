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
const lastRun_exports = {};
__export(lastRun_exports, {
  LastRunReporter: () => LastRunReporter
});
module.exports = __toCommonJS(lastRun_exports);
const import_fs = __toESM(require("fs"));
const import_path = __toESM(require("path"));
const import_projectUtils = require("./projectUtils");
class LastRunReporter {
  constructor(config) {
    this._config = config;
    const [project] = (0, import_projectUtils.filterProjects)(config.projects, config.cliProjectFilter);
    if (project)
      this._lastRunFile = import_path.default.join(project.project.outputDir, ".last-run.json");
  }
  async filterLastFailed() {
    if (!this._lastRunFile)
      return;
    try {
      const lastRunInfo = JSON.parse(await import_fs.default.promises.readFile(this._lastRunFile, "utf8"));
      const failedTestIds = new Set(lastRunInfo.failedTests);
      this._config.postShardTestFilters.push((test) => failedTestIds.has(test.id));
    } catch {
    }
  }
  version() {
    return "v2";
  }
  printsToStdio() {
    return false;
  }
  onBegin(suite) {
    this._suite = suite;
  }
  async onEnd(result) {
    if (!this._lastRunFile || this._config.cliListOnly)
      return;
    const lastRunInfo = {
      status: result.status,
      failedTests: this._suite?.allTests().filter((t) => !t.ok()).map((t) => t.id) || []
    };
    await import_fs.default.promises.mkdir(import_path.default.dirname(this._lastRunFile), { recursive: true });
    await import_fs.default.promises.writeFile(this._lastRunFile, JSON.stringify(lastRunInfo, void 0, 2));
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LastRunReporter
});

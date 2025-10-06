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
const internalReporter_exports = {};
__export(internalReporter_exports, {
  InternalReporter: () => InternalReporter
});
module.exports = __toCommonJS(internalReporter_exports);
const import_fs = __toESM(require("fs"));
const import_utils = require("playwright-core/lib/utils");
const import_base = require("./base");
const import_multiplexer = require("./multiplexer");
const import_test = require("../common/test");
const import_babelBundle = require("../transform/babelBundle");
const import_reporterV2 = require("./reporterV2");
class InternalReporter {
  constructor(reporters) {
    this._didBegin = false;
    this._reporter = new import_multiplexer.Multiplexer(reporters.map(import_reporterV2.wrapReporterAsV2));
  }
  version() {
    return "v2";
  }
  onConfigure(config) {
    this._config = config;
    this._startTime = /* @__PURE__ */ new Date();
    this._monotonicStartTime = (0, import_utils.monotonicTime)();
    this._reporter.onConfigure?.(config);
  }
  onBegin(suite) {
    this._didBegin = true;
    this._reporter.onBegin?.(suite);
  }
  onTestBegin(test, result) {
    this._reporter.onTestBegin?.(test, result);
  }
  onStdOut(chunk, test, result) {
    this._reporter.onStdOut?.(chunk, test, result);
  }
  onStdErr(chunk, test, result) {
    this._reporter.onStdErr?.(chunk, test, result);
  }
  onTestEnd(test, result) {
    this._addSnippetToTestErrors(test, result);
    this._reporter.onTestEnd?.(test, result);
  }
  async onEnd(result) {
    if (!this._didBegin) {
      this.onBegin(new import_test.Suite("", "root"));
    }
    return await this._reporter.onEnd?.({
      ...result,
      startTime: this._startTime,
      duration: (0, import_utils.monotonicTime)() - this._monotonicStartTime
    });
  }
  async onExit() {
    await this._reporter.onExit?.();
  }
  onError(error) {
    addLocationAndSnippetToError(this._config, error);
    this._reporter.onError?.(error);
  }
  onStepBegin(test, result, step) {
    this._reporter.onStepBegin?.(test, result, step);
  }
  onStepEnd(test, result, step) {
    this._addSnippetToStepError(test, step);
    this._reporter.onStepEnd?.(test, result, step);
  }
  printsToStdio() {
    return this._reporter.printsToStdio ? this._reporter.printsToStdio() : true;
  }
  _addSnippetToTestErrors(test, result) {
    for (const error of result.errors)
      addLocationAndSnippetToError(this._config, error, test.location.file);
  }
  _addSnippetToStepError(test, step) {
    if (step.error)
      addLocationAndSnippetToError(this._config, step.error, test.location.file);
  }
}
function addLocationAndSnippetToError(config, error, file) {
  if (error.stack && !error.location)
    error.location = (0, import_base.prepareErrorStack)(error.stack).location;
  const location = error.location;
  if (!location)
    return;
  try {
    const tokens = [];
    const source = import_fs.default.readFileSync(location.file, "utf8");
    const codeFrame = (0, import_babelBundle.codeFrameColumns)(source, { start: location }, { highlightCode: true });
    if (!file || import_fs.default.realpathSync(file) !== location.file) {
      tokens.push(import_base.internalScreen.colors.gray(`   at `) + `${(0, import_base.relativeFilePath)(import_base.internalScreen, config, location.file)}:${location.line}`);
      tokens.push("");
    }
    tokens.push(codeFrame);
    error.snippet = tokens.join("\n");
  } catch (e) {
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InternalReporter
});

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
const dot_exports = {};
__export(dot_exports, {
  default: () => dot_default
});
module.exports = __toCommonJS(dot_exports);
const import_base = require("./base");
class DotReporter extends import_base.TerminalReporter {
  constructor() {
    super(...arguments);
    this._counter = 0;
  }
  onBegin(suite) {
    super.onBegin(suite);
    this.writeLine(this.generateStartingMessage());
  }
  onStdOut(chunk, test, result) {
    super.onStdOut(chunk, test, result);
    if (!this.config.quiet)
      this.screen.stdout.write(chunk);
  }
  onStdErr(chunk, test, result) {
    super.onStdErr(chunk, test, result);
    if (!this.config.quiet)
      this.screen.stderr.write(chunk);
  }
  onTestEnd(test, result) {
    super.onTestEnd(test, result);
    if (this._counter === 80) {
      this.screen.stdout.write("\n");
      this._counter = 0;
    }
    ++this._counter;
    if (result.status === "skipped") {
      this.screen.stdout.write(this.screen.colors.yellow("\xB0"));
      return;
    }
    if (this.willRetry(test)) {
      this.screen.stdout.write(this.screen.colors.gray("\xD7"));
      return;
    }
    switch (test.outcome()) {
      case "expected":
        this.screen.stdout.write(this.screen.colors.green("\xB7"));
        break;
      case "unexpected":
        this.screen.stdout.write(this.screen.colors.red(result.status === "timedOut" ? "T" : "F"));
        break;
      case "flaky":
        this.screen.stdout.write(this.screen.colors.yellow("\xB1"));
        break;
    }
  }
  onError(error) {
    super.onError(error);
    this.writeLine("\n" + this.formatError(error).message);
    this._counter = 0;
  }
  async onEnd(result) {
    await super.onEnd(result);
    this.screen.stdout.write("\n");
    this.epilogue(true);
  }
}
var dot_default = DotReporter;

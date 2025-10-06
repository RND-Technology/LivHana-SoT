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
const toBeTruthy_exports = {};
__export(toBeTruthy_exports, {
  toBeTruthy: () => toBeTruthy
});
module.exports = __toCommonJS(toBeTruthy_exports);
const import_util = require("../util");
const import_matcherHint = require("./matcherHint");
async function toBeTruthy(matcherName, receiver, receiverType, expected, arg, query, options = {}) {
  (0, import_util.expectTypes)(receiver, [receiverType], matcherName);
  const matcherOptions = {
    isNot: this.isNot,
    promise: this.promise
  };
  const timeout = options.timeout ?? this.timeout;
  const { matches: pass, log, timedOut, received } = await query(!!this.isNot, timeout);
  if (pass === !this.isNot) {
    return {
      name: matcherName,
      message: () => "",
      pass,
      expected
    };
  }
  const notFound = received === import_matcherHint.kNoElementsFoundError ? received : void 0;
  let printedReceived;
  let printedExpected;
  if (pass) {
    printedExpected = `Expected: not ${expected}`;
    printedReceived = `Received: ${notFound ? import_matcherHint.kNoElementsFoundError : expected}`;
  } else {
    printedExpected = `Expected: ${expected}`;
    printedReceived = `Received: ${notFound ? import_matcherHint.kNoElementsFoundError : received}`;
  }
  const message = () => {
    const header = (0, import_matcherHint.matcherHint)(this, receiver, matcherName, "locator", arg, matcherOptions, timedOut ? timeout : void 0, `${printedExpected}
${printedReceived}`);
    const logText = (0, import_util.callLogText)(log);
    return `${header}${logText}`;
  };
  return {
    message,
    pass,
    actual: received,
    name: matcherName,
    expected,
    log,
    timeout: timedOut ? timeout : void 0
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  toBeTruthy
});

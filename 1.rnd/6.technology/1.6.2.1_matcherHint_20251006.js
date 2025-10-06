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
const matcherHint_exports = {};
__export(matcherHint_exports, {
  ExpectError: () => ExpectError,
  isJestError: () => isJestError,
  kNoElementsFoundError: () => kNoElementsFoundError,
  matcherHint: () => matcherHint
});
module.exports = __toCommonJS(matcherHint_exports);
const import_utils = require("playwright-core/lib/utils");
const kNoElementsFoundError = "<element(s) not found>";
function matcherHint(state, locator, matcherName, expression, actual, matcherOptions, timeout, expectedReceivedString, preventExtraStatIndent = false) {
  let header = state.utils.matcherHint(matcherName, expression, actual, matcherOptions).replace(/ \/\/ deep equality/, "") + " failed\n\n";
  const extraSpace = preventExtraStatIndent ? "" : " ";
  if (locator)
    header += `Locator: ${extraSpace}${String(locator)}
`;
  if (expectedReceivedString)
    header += `${expectedReceivedString}
`;
  if (timeout)
    header += `Timeout: ${extraSpace}${timeout}ms
`;
  return header;
}
class ExpectError extends Error {
  constructor(jestError, customMessage, stackFrames) {
    super("");
    this.name = jestError.name;
    this.message = jestError.message;
    this.matcherResult = jestError.matcherResult;
    if (customMessage)
      this.message = customMessage + "\n\n" + this.message;
    this.stack = this.name + ": " + this.message + "\n" + (0, import_utils.stringifyStackFrames)(stackFrames).join("\n");
  }
}
function isJestError(e) {
  return e instanceof Error && "matcherResult" in e;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ExpectError,
  isJestError,
  kNoElementsFoundError,
  matcherHint
});

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
const expectBundle_exports = {};
__export(expectBundle_exports, {
  EXPECTED_COLOR: () => EXPECTED_COLOR,
  INVERTED_COLOR: () => INVERTED_COLOR,
  RECEIVED_COLOR: () => RECEIVED_COLOR,
  asymmetricMatchers: () => asymmetricMatchers,
  expect: () => expect,
  matcherUtils: () => matcherUtils,
  mock: () => mock,
  printReceived: () => printReceived
});
module.exports = __toCommonJS(expectBundle_exports);
const expect = require("./expectBundleImpl").expect;
const mock = require("./expectBundleImpl").mock;
const asymmetricMatchers = require("./expectBundleImpl").asymmetricMatchers;
const matcherUtils = require("./expectBundleImpl").matcherUtils;
const EXPECTED_COLOR = require("./expectBundleImpl").EXPECTED_COLOR;
const INVERTED_COLOR = require("./expectBundleImpl").INVERTED_COLOR;
const RECEIVED_COLOR = require("./expectBundleImpl").RECEIVED_COLOR;
const printReceived = require("./expectBundleImpl").printReceived;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EXPECTED_COLOR,
  INVERTED_COLOR,
  RECEIVED_COLOR,
  asymmetricMatchers,
  expect,
  matcherUtils,
  mock,
  printReceived
});

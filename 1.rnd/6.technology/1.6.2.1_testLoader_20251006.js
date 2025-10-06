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
const testLoader_exports = {};
__export(testLoader_exports, {
  defaultTimeout: () => defaultTimeout,
  loadTestFile: () => loadTestFile
});
module.exports = __toCommonJS(testLoader_exports);
const import_path = __toESM(require("path"));
const import_util = __toESM(require("util"));
const esmLoaderHost = __toESM(require("./esmLoaderHost"));
const import_globals = require("./globals");
const import_test = require("./test");
const import_compilationCache = require("../transform/compilationCache");
const import_transform = require("../transform/transform");
const import_util2 = require("../util");
const defaultTimeout = 3e4;
const cachedFileSuites = /* @__PURE__ */ new Map();
async function loadTestFile(file, rootDir, testErrors) {
  if (cachedFileSuites.has(file))
    return cachedFileSuites.get(file);
  const suite = new import_test.Suite(import_path.default.relative(rootDir, file) || import_path.default.basename(file), "file");
  suite._requireFile = file;
  suite.location = { file, line: 0, column: 0 };
  (0, import_globals.setCurrentlyLoadingFileSuite)(suite);
  if (!(0, import_globals.isWorkerProcess)()) {
    (0, import_compilationCache.startCollectingFileDeps)();
    await esmLoaderHost.startCollectingFileDeps();
  }
  try {
    await (0, import_transform.requireOrImport)(file);
    cachedFileSuites.set(file, suite);
  } catch (e) {
    if (!testErrors)
      throw e;
    testErrors.push(serializeLoadError(file, e));
  } finally {
    (0, import_globals.setCurrentlyLoadingFileSuite)(void 0);
    if (!(0, import_globals.isWorkerProcess)()) {
      (0, import_compilationCache.stopCollectingFileDeps)(file);
      await esmLoaderHost.stopCollectingFileDeps(file);
    }
  }
  {
    const files = /* @__PURE__ */ new Set();
    suite.allTests().map((t) => files.add(t.location.file));
    if (files.size === 1) {
      const mappedFile = files.values().next().value;
      if (suite.location.file !== mappedFile) {
        if (import_path.default.extname(mappedFile) !== import_path.default.extname(suite.location.file))
          suite.location.file = mappedFile;
      }
    }
  }
  return suite;
}
function serializeLoadError(file, error) {
  if (error instanceof Error) {
    const result = (0, import_util2.filterStackTrace)(error);
    const loc = error.loc;
    result.location = loc ? {
      file,
      line: loc.line || 0,
      column: loc.column || 0
    } : void 0;
    return result;
  }
  return { value: import_util.default.inspect(error) };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  defaultTimeout,
  loadTestFile
});

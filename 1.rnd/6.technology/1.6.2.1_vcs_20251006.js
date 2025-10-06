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
const vcs_exports = {};
__export(vcs_exports, {
  detectChangedTestFiles: () => detectChangedTestFiles
});
module.exports = __toCommonJS(vcs_exports);
const import_child_process = __toESM(require("child_process"));
const import_path = __toESM(require("path"));
const import_compilationCache = require("../transform/compilationCache");
async function detectChangedTestFiles(baseCommit, configDir) {
  function gitFileList(command) {
    try {
      return import_child_process.default.execSync(
        `git ${command}`,
        { encoding: "utf-8", stdio: "pipe", cwd: configDir }
      ).split("\n").filter(Boolean);
    } catch (_error) {
      const error = _error;
      const unknownRevision = error.output.some((line) => line?.includes("unknown revision"));
      if (unknownRevision) {
        const isShallowClone = import_child_process.default.execSync("git rev-parse --is-shallow-repository", { encoding: "utf-8", stdio: "pipe", cwd: configDir }).trim() === "true";
        if (isShallowClone) {
          throw new Error([
            `The repository is a shallow clone and does not have '${baseCommit}' available locally.`,
            `Note that GitHub Actions checkout is shallow by default: https://github.com/actions/checkout`
          ].join("\n"));
        }
      }
      throw new Error([
        `Cannot detect changed files for --only-changed mode:`,
        `git ${command}`,
        "",
        ...error.output
      ].join("\n"));
    }
  }
  const untrackedFiles = gitFileList(`ls-files --others --exclude-standard`).map((file) => import_path.default.join(configDir, file));
  const [gitRoot] = gitFileList("rev-parse --show-toplevel");
  const trackedFilesWithChanges = gitFileList(`diff ${baseCommit} --name-only`).map((file) => import_path.default.join(gitRoot, file));
  return new Set((0, import_compilationCache.affectedTestFiles)([...untrackedFiles, ...trackedFilesWithChanges]));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  detectChangedTestFiles
});

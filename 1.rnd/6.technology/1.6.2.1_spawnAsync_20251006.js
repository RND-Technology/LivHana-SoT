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
const spawnAsync_exports = {};
__export(spawnAsync_exports, {
  spawnAsync: () => spawnAsync
});
module.exports = __toCommonJS(spawnAsync_exports);
const import_child_process = require("child_process");
function spawnAsync(cmd, args, options = {}) {
  const process = (0, import_child_process.spawn)(cmd, args, Object.assign({ windowsHide: true }, options));
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    if (process.stdout)
      process.stdout.on("data", (data) => stdout += data.toString());
    if (process.stderr)
      process.stderr.on("data", (data) => stderr += data.toString());
    process.on("close", (code) => resolve({ stdout, stderr, code }));
    process.on("error", (error) => resolve({ stdout, stderr, code: 0, error }));
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  spawnAsync
});

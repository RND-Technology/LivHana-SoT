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
const profiler_exports = {};
__export(profiler_exports, {
  startProfiling: () => startProfiling,
  stopProfiling: () => stopProfiling
});
module.exports = __toCommonJS(profiler_exports);
const import_fs = __toESM(require("fs"));
const import_path = __toESM(require("path"));
const profileDir = process.env.PWTEST_PROFILE_DIR || "";
let session;
async function startProfiling() {
  if (!profileDir)
    return;
  session = new (require("inspector")).Session();
  session.connect();
  await new Promise((f) => {
    session.post("Profiler.enable", () => {
      session.post("Profiler.start", f);
    });
  });
}
async function stopProfiling(profileName) {
  if (!profileDir)
    return;
  await new Promise((f) => session.post("Profiler.stop", (err, { profile }) => {
    if (!err) {
      import_fs.default.mkdirSync(profileDir, { recursive: true });
      import_fs.default.writeFileSync(import_path.default.join(profileDir, profileName + ".json"), JSON.stringify(profile));
    }
    f();
  }));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  startProfiling,
  stopProfiling
});

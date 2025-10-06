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
const video_exports = {};
__export(video_exports, {
  Video: () => Video
});
module.exports = __toCommonJS(video_exports);
const import_manualPromise = require("../utils/isomorphic/manualPromise");
class Video {
  constructor(page, connection) {
    this._artifact = null;
    this._artifactReadyPromise = new import_manualPromise.ManualPromise();
    this._isRemote = false;
    this._isRemote = connection.isRemote();
    this._artifact = page._closedOrCrashedScope.safeRace(this._artifactReadyPromise);
  }
  _artifactReady(artifact) {
    this._artifactReadyPromise.resolve(artifact);
  }
  async path() {
    if (this._isRemote)
      throw new Error(`Path is not available when connecting remotely. Use saveAs() to save a local copy.`);
    const artifact = await this._artifact;
    if (!artifact)
      throw new Error("Page did not produce any video frames");
    return artifact._initializer.absolutePath;
  }
  async saveAs(path) {
    const artifact = await this._artifact;
    if (!artifact)
      throw new Error("Page did not produce any video frames");
    return await artifact.saveAs(path);
  }
  async delete() {
    const artifact = await this._artifact;
    if (artifact)
      await artifact.delete();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Video
});

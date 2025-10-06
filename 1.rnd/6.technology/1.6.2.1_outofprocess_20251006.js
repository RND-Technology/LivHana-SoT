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
const outofprocess_exports = {};
__export(outofprocess_exports, {
  start: () => start
});
module.exports = __toCommonJS(outofprocess_exports);
const childProcess = __toESM(require("child_process"));
const import_path = __toESM(require("path"));
const import_connection = require("./client/connection");
const import_pipeTransport = require("./server/utils/pipeTransport");
const import_manualPromise = require("./utils/isomorphic/manualPromise");
const import_nodePlatform = require("./server/utils/nodePlatform");
async function start(env = {}) {
  const client = new PlaywrightClient(env);
  const playwright = await client._playwright;
  playwright.driverProcess = client._driverProcess;
  return { playwright, stop: () => client.stop() };
}
class PlaywrightClient {
  constructor(env) {
    this._closePromise = new import_manualPromise.ManualPromise();
    this._driverProcess = childProcess.fork(import_path.default.join(__dirname, "..", "cli.js"), ["run-driver"], {
      stdio: "pipe",
      detached: true,
      env: {
        ...process.env,
        ...env
      }
    });
    this._driverProcess.unref();
    this._driverProcess.stderr.on("data", (data) => process.stderr.write(data));
    const connection = new import_connection.Connection(import_nodePlatform.nodePlatform);
    const transport = new import_pipeTransport.PipeTransport(this._driverProcess.stdin, this._driverProcess.stdout);
    connection.onmessage = (message) => transport.send(JSON.stringify(message));
    transport.onmessage = (message) => connection.dispatch(JSON.parse(message));
    transport.onclose = () => this._closePromise.resolve();
    this._playwright = connection.initializePlaywright();
  }
  async stop() {
    this._driverProcess.stdin.destroy();
    this._driverProcess.stdout.destroy();
    this._driverProcess.stderr.destroy();
    await this._closePromise;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  start
});

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
const driver_exports = {};
__export(driver_exports, {
  launchBrowserServer: () => launchBrowserServer,
  printApiJson: () => printApiJson,
  runDriver: () => runDriver,
  runServer: () => runServer
});
module.exports = __toCommonJS(driver_exports);
const import_fs = __toESM(require("fs"));
const playwright = __toESM(require("../.."));
const import_pipeTransport = require("../server/utils/pipeTransport");
const import_playwrightServer = require("../remote/playwrightServer");
const import_server = require("../server");
const import_processLauncher = require("../server/utils/processLauncher");
function printApiJson() {
  console.log(JSON.stringify(require("../../api.json")));
}
function runDriver() {
  const dispatcherConnection = new import_server.DispatcherConnection();
  new import_server.RootDispatcher(dispatcherConnection, async (rootScope, { sdkLanguage }) => {
    const playwright2 = (0, import_server.createPlaywright)({ sdkLanguage });
    return new import_server.PlaywrightDispatcher(rootScope, playwright2);
  });
  const transport = new import_pipeTransport.PipeTransport(process.stdout, process.stdin);
  transport.onmessage = (message) => dispatcherConnection.dispatch(JSON.parse(message));
  const isJavaScriptLanguageBinding = !process.env.PW_LANG_NAME || process.env.PW_LANG_NAME === "javascript";
  const replacer = !isJavaScriptLanguageBinding && String.prototype.toWellFormed ? (key, value) => {
    if (typeof value === "string")
      return value.toWellFormed();
    return value;
  } : void 0;
  dispatcherConnection.onmessage = (message) => transport.send(JSON.stringify(message, replacer));
  transport.onclose = () => {
    dispatcherConnection.onmessage = () => {
    };
    (0, import_processLauncher.gracefullyProcessExitDoNotHang)(0);
  };
  process.on("SIGINT", () => {
  });
}
async function runServer(options) {
  const {
    port,
    host,
    path = "/",
    maxConnections = Infinity,
    extension
  } = options;
  const server = new import_playwrightServer.PlaywrightServer({ mode: extension ? "extension" : "default", path, maxConnections });
  const wsEndpoint = await server.listen(port, host);
  process.on("exit", () => server.close().catch(console.error));
  console.log("Listening on " + wsEndpoint);
  process.stdin.on("close", () => (0, import_processLauncher.gracefullyProcessExitDoNotHang)(0));
}
async function launchBrowserServer(browserName, configFile) {
  let options = {};
  if (configFile)
    options = JSON.parse(import_fs.default.readFileSync(configFile).toString());
  const browserType = playwright[browserName];
  const server = await browserType.launchServer(options);
  console.log(server.wsEndpoint());
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  launchBrowserServer,
  printApiJson,
  runDriver,
  runServer
});

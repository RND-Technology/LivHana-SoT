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
const inProcessFactory_exports = {};
__export(inProcessFactory_exports, {
  createInProcessPlaywright: () => createInProcessPlaywright
});
module.exports = __toCommonJS(inProcessFactory_exports);
const import_androidServerImpl = require("./androidServerImpl");
const import_browserServerImpl = require("./browserServerImpl");
const import_server = require("./server");
const import_nodePlatform = require("./server/utils/nodePlatform");
const import_connection = require("./client/connection");
function createInProcessPlaywright() {
  const playwright = (0, import_server.createPlaywright)({ sdkLanguage: process.env.PW_LANG_NAME || "javascript" });
  const clientConnection = new import_connection.Connection(import_nodePlatform.nodePlatform);
  clientConnection.useRawBuffers();
  const dispatcherConnection = new import_server.DispatcherConnection(
    true
    /* local */
  );
  dispatcherConnection.onmessage = (message) => clientConnection.dispatch(message);
  clientConnection.onmessage = (message) => dispatcherConnection.dispatch(message);
  const rootScope = new import_server.RootDispatcher(dispatcherConnection);
  new import_server.PlaywrightDispatcher(rootScope, playwright);
  const playwrightAPI = clientConnection.getObjectWithKnownName("Playwright");
  playwrightAPI.chromium._serverLauncher = new import_browserServerImpl.BrowserServerLauncherImpl("chromium");
  playwrightAPI.firefox._serverLauncher = new import_browserServerImpl.BrowserServerLauncherImpl("firefox");
  playwrightAPI.webkit._serverLauncher = new import_browserServerImpl.BrowserServerLauncherImpl("webkit");
  playwrightAPI._android._serverLauncher = new import_androidServerImpl.AndroidServerLauncherImpl();
  playwrightAPI._bidiChromium._serverLauncher = new import_browserServerImpl.BrowserServerLauncherImpl("_bidiChromium");
  playwrightAPI._bidiFirefox._serverLauncher = new import_browserServerImpl.BrowserServerLauncherImpl("_bidiFirefox");
  dispatcherConnection.onmessage = (message) => setImmediate(() => clientConnection.dispatch(message));
  clientConnection.onmessage = (message) => setImmediate(() => dispatcherConnection.dispatch(message));
  clientConnection.toImpl = (x) => {
    if (x instanceof import_connection.Connection)
      return x === clientConnection ? dispatcherConnection : void 0;
    if (!x)
      return dispatcherConnection._dispatcherByGuid.get("");
    return dispatcherConnection._dispatcherByGuid.get(x._guid)._object;
  };
  return playwrightAPI;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createInProcessPlaywright
});

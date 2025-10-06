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
const browserServerImpl_exports = {};
__export(browserServerImpl_exports, {
  BrowserServerLauncherImpl: () => BrowserServerLauncherImpl
});
module.exports = __toCommonJS(browserServerImpl_exports);
const import_playwrightServer = require("./remote/playwrightServer");
const import_helper = require("./server/helper");
const import_playwright = require("./server/playwright");
const import_crypto = require("./server/utils/crypto");
const import_debug = require("./server/utils/debug");
const import_stackTrace = require("./utils/isomorphic/stackTrace");
const import_time = require("./utils/isomorphic/time");
const import_utilsBundle = require("./utilsBundle");
const validatorPrimitives = __toESM(require("./protocol/validatorPrimitives"));
const import_progress = require("./server/progress");
class BrowserServerLauncherImpl {
  constructor(browserName) {
    this._browserName = browserName;
  }
  async launchServer(options = {}) {
    const playwright = (0, import_playwright.createPlaywright)({ sdkLanguage: "javascript", isServer: true });
    const metadata = { id: "", startTime: 0, endTime: 0, type: "Internal", method: "", params: {}, log: [], internal: true };
    const validatorContext = {
      tChannelImpl: (names, arg, path) => {
        throw new validatorPrimitives.ValidationError(`${path}: channels are not expected in launchServer`);
      },
      binary: "buffer",
      isUnderTest: import_debug.isUnderTest
    };
    let launchOptions = {
      ...options,
      ignoreDefaultArgs: Array.isArray(options.ignoreDefaultArgs) ? options.ignoreDefaultArgs : void 0,
      ignoreAllDefaultArgs: !!options.ignoreDefaultArgs && !Array.isArray(options.ignoreDefaultArgs),
      env: options.env ? envObjectToArray(options.env) : void 0,
      timeout: options.timeout ?? import_time.DEFAULT_PLAYWRIGHT_LAUNCH_TIMEOUT
    };
    let browser;
    try {
      const controller = new import_progress.ProgressController(metadata);
      browser = await controller.run(async (progress) => {
        if (options._userDataDir !== void 0) {
          const validator = validatorPrimitives.scheme["BrowserTypeLaunchPersistentContextParams"];
          launchOptions = validator({ ...launchOptions, userDataDir: options._userDataDir }, "", validatorContext);
          const context = await playwright[this._browserName].launchPersistentContext(progress, options._userDataDir, launchOptions);
          return context._browser;
        } else {
          const validator = validatorPrimitives.scheme["BrowserTypeLaunchParams"];
          launchOptions = validator(launchOptions, "", validatorContext);
          return await playwright[this._browserName].launch(progress, launchOptions, toProtocolLogger(options.logger));
        }
      });
    } catch (e) {
      const log = import_helper.helper.formatBrowserLogs(metadata.log);
      (0, import_stackTrace.rewriteErrorMessage)(e, `${e.message} Failed to launch browser.${log}`);
      throw e;
    }
    return this.launchServerOnExistingBrowser(browser, options);
  }
  async launchServerOnExistingBrowser(browser, options) {
    const path = options.wsPath ? options.wsPath.startsWith("/") ? options.wsPath : `/${options.wsPath}` : `/${(0, import_crypto.createGuid)()}`;
    const server = new import_playwrightServer.PlaywrightServer({ mode: options._sharedBrowser ? "launchServerShared" : "launchServer", path, maxConnections: Infinity, preLaunchedBrowser: browser, debugController: options._debugController });
    const wsEndpoint = await server.listen(options.port, options.host);
    const browserServer = new import_utilsBundle.ws.EventEmitter();
    browserServer.process = () => browser.options.browserProcess.process;
    browserServer.wsEndpoint = () => wsEndpoint;
    browserServer.close = () => browser.options.browserProcess.close();
    browserServer[Symbol.asyncDispose] = browserServer.close;
    browserServer.kill = () => browser.options.browserProcess.kill();
    browserServer._disconnectForTest = () => server.close();
    browserServer._userDataDirForTest = browser._userDataDirForTest;
    browser.options.browserProcess.onclose = (exitCode, signal) => {
      server.close();
      browserServer.emit("close", exitCode, signal);
    };
    return browserServer;
  }
}
function toProtocolLogger(logger) {
  return logger ? (direction, message) => {
    if (logger.isEnabled("protocol", "verbose"))
      logger.log("protocol", "verbose", (direction === "send" ? "SEND \u25BA " : "\u25C0 RECV ") + JSON.stringify(message), [], {});
  } : void 0;
}
function envObjectToArray(env) {
  const result = [];
  for (const name in env) {
    if (!Object.is(env[name], void 0))
      result.push({ name, value: String(env[name]) });
  }
  return result;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BrowserServerLauncherImpl
});

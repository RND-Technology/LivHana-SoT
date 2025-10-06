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
const firefox_exports = {};
__export(firefox_exports, {
  Firefox: () => Firefox
});
module.exports = __toCommonJS(firefox_exports);
const import_os = __toESM(require("os"));
const import_path = __toESM(require("path"));
const import_ffBrowser = require("./ffBrowser");
const import_ffConnection = require("./ffConnection");
const import_ascii = require("../utils/ascii");
const import_browserType = require("../browserType");
const import_manualPromise = require("../../utils/isomorphic/manualPromise");
class Firefox extends import_browserType.BrowserType {
  constructor(parent) {
    super(parent, "firefox");
  }
  connectToTransport(transport, options) {
    return import_ffBrowser.FFBrowser.connect(this.attribution.playwright, transport, options);
  }
  doRewriteStartupLog(error) {
    if (!error.logs)
      return error;
    if (error.logs.includes(`as root in a regular user's session is not supported.`))
      error.logs = "\n" + (0, import_ascii.wrapInASCIIBox)(`Firefox is unable to launch if the $HOME folder isn't owned by the current user.
Workaround: Set the HOME=/root environment variable${process.env.GITHUB_ACTION ? " in your GitHub Actions workflow file" : ""} when running Playwright.`, 1);
    if (error.logs.includes("no DISPLAY environment variable specified"))
      error.logs = "\n" + (0, import_ascii.wrapInASCIIBox)(import_browserType.kNoXServerRunningError, 1);
    return error;
  }
  amendEnvironment(env) {
    if (!import_path.default.isAbsolute(import_os.default.homedir()))
      throw new Error(`Cannot launch Firefox with relative home directory. Did you set ${import_os.default.platform() === "win32" ? "USERPROFILE" : "HOME"} to a relative path?`);
    if (import_os.default.platform() === "linux") {
      return { ...env, SNAP_NAME: void 0, SNAP_INSTANCE_NAME: void 0 };
    }
    return env;
  }
  attemptToGracefullyCloseBrowser(transport) {
    const message = { method: "Browser.close", params: {}, id: import_ffConnection.kBrowserCloseMessageId };
    transport.send(message);
  }
  defaultArgs(options, isPersistent, userDataDir) {
    const { args = [], headless } = options;
    const userDataDirArg = args.find((arg) => arg.startsWith("-profile") || arg.startsWith("--profile"));
    if (userDataDirArg)
      throw this._createUserDataDirArgMisuseError("--profile");
    if (args.find((arg) => arg.startsWith("-juggler")))
      throw new Error("Use the port parameter instead of -juggler argument");
    const firefoxArguments = ["-no-remote"];
    if (headless) {
      firefoxArguments.push("-headless");
    } else {
      firefoxArguments.push("-wait-for-browser");
      firefoxArguments.push("-foreground");
    }
    firefoxArguments.push(`-profile`, userDataDir);
    firefoxArguments.push("-juggler-pipe");
    firefoxArguments.push(...args);
    if (isPersistent)
      firefoxArguments.push("about:blank");
    else
      firefoxArguments.push("-silent");
    return firefoxArguments;
  }
  waitForReadyState(options, browserLogsCollector) {
    const result = new import_manualPromise.ManualPromise();
    browserLogsCollector.onMessage((message) => {
      if (message.includes("Juggler listening to the pipe"))
        result.resolve({});
    });
    return result;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Firefox
});

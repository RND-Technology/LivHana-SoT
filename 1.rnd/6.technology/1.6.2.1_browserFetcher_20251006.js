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
const browserFetcher_exports = {};
__export(browserFetcher_exports, {
  downloadBrowserWithProgressBar: () => downloadBrowserWithProgressBar,
  logPolitely: () => logPolitely
});
module.exports = __toCommonJS(browserFetcher_exports);
const childProcess = __toESM(require("child_process"));
const import_fs = __toESM(require("fs"));
const import_os = __toESM(require("os"));
const import_path = __toESM(require("path"));
const import_debugLogger = require("../utils/debugLogger");
const import_manualPromise = require("../../utils/isomorphic/manualPromise");
const import_userAgent = require("../utils/userAgent");
const import_utilsBundle = require("../../utilsBundle");
const import_fileUtils = require("../utils/fileUtils");
const import__ = require(".");
async function downloadBrowserWithProgressBar(title, browserDirectory, executablePath, downloadURLs, downloadFileName, downloadSocketTimeout) {
  if (await (0, import_fileUtils.existsAsync)((0, import__.browserDirectoryToMarkerFilePath)(browserDirectory))) {
    import_debugLogger.debugLogger.log("install", `${title} is already downloaded.`);
    return false;
  }
  const zipPath = import_path.default.join(import_os.default.tmpdir(), downloadFileName);
  try {
    const retryCount = 5;
    for (let attempt = 1; attempt <= retryCount; ++attempt) {
      import_debugLogger.debugLogger.log("install", `downloading ${title} - attempt #${attempt}`);
      const url = downloadURLs[(attempt - 1) % downloadURLs.length];
      logPolitely(`Downloading ${title}` + import_utilsBundle.colors.dim(` from ${url}`));
      const { error } = await downloadBrowserWithProgressBarOutOfProcess(title, browserDirectory, url, zipPath, executablePath, downloadSocketTimeout);
      if (!error) {
        import_debugLogger.debugLogger.log("install", `SUCCESS installing ${title}`);
        break;
      }
      if (await (0, import_fileUtils.existsAsync)(zipPath))
        await import_fs.default.promises.unlink(zipPath);
      if (await (0, import_fileUtils.existsAsync)(browserDirectory))
        await import_fs.default.promises.rmdir(browserDirectory, { recursive: true });
      const errorMessage = error?.message || "";
      import_debugLogger.debugLogger.log("install", `attempt #${attempt} - ERROR: ${errorMessage}`);
      if (attempt >= retryCount)
        throw error;
    }
  } catch (e) {
    import_debugLogger.debugLogger.log("install", `FAILED installation ${title} with error: ${e}`);
    process.exitCode = 1;
    throw e;
  } finally {
    if (await (0, import_fileUtils.existsAsync)(zipPath))
      await import_fs.default.promises.unlink(zipPath);
  }
  logPolitely(`${title} downloaded to ${browserDirectory}`);
  return true;
}
function downloadBrowserWithProgressBarOutOfProcess(title, browserDirectory, url, zipPath, executablePath, socketTimeout) {
  const cp = childProcess.fork(import_path.default.join(__dirname, "oopDownloadBrowserMain.js"));
  const promise = new import_manualPromise.ManualPromise();
  const progress = getDownloadProgress();
  cp.on("message", (message) => {
    if (message?.method === "log")
      import_debugLogger.debugLogger.log("install", message.params.message);
    if (message?.method === "progress")
      progress(message.params.done, message.params.total);
  });
  cp.on("exit", (code) => {
    if (code !== 0) {
      promise.resolve({ error: new Error(`Download failure, code=${code}`) });
      return;
    }
    if (!import_fs.default.existsSync((0, import__.browserDirectoryToMarkerFilePath)(browserDirectory)))
      promise.resolve({ error: new Error(`Download failure, ${(0, import__.browserDirectoryToMarkerFilePath)(browserDirectory)} does not exist`) });
    else
      promise.resolve({ error: null });
  });
  cp.on("error", (error) => {
    promise.resolve({ error });
  });
  import_debugLogger.debugLogger.log("install", `running download:`);
  import_debugLogger.debugLogger.log("install", `-- from url: ${url}`);
  import_debugLogger.debugLogger.log("install", `-- to location: ${zipPath}`);
  const downloadParams = {
    title,
    browserDirectory,
    url,
    zipPath,
    executablePath,
    socketTimeout,
    userAgent: (0, import_userAgent.getUserAgent)()
  };
  cp.send({ method: "download", params: downloadParams });
  return promise;
}
function logPolitely(toBeLogged) {
  const logLevel = process.env.npm_config_loglevel;
  const logLevelDisplay = ["silent", "error", "warn"].indexOf(logLevel || "") > -1;
  if (!logLevelDisplay)
    console.log(toBeLogged);
}
function getDownloadProgress() {
  if (process.stdout.isTTY)
    return getAnimatedDownloadProgress();
  return getBasicDownloadProgress();
}
function getAnimatedDownloadProgress() {
  let progressBar;
  let lastDownloadedBytes = 0;
  return (downloadedBytes, totalBytes) => {
    if (!progressBar) {
      progressBar = new import_utilsBundle.progress(
        `${toMegabytes(
          totalBytes
        )} [:bar] :percent :etas`,
        {
          complete: "=",
          incomplete: " ",
          width: 20,
          total: totalBytes
        }
      );
    }
    const delta = downloadedBytes - lastDownloadedBytes;
    lastDownloadedBytes = downloadedBytes;
    progressBar.tick(delta);
  };
}
function getBasicDownloadProgress() {
  const totalRows = 10;
  const stepWidth = 8;
  let lastRow = -1;
  return (downloadedBytes, totalBytes) => {
    const percentage = downloadedBytes / totalBytes;
    const row = Math.floor(totalRows * percentage);
    if (row > lastRow) {
      lastRow = row;
      const percentageString = String(percentage * 100 | 0).padStart(3);
      console.log(`|${"\u25A0".repeat(row * stepWidth)}${" ".repeat((totalRows - row) * stepWidth)}| ${percentageString}% of ${toMegabytes(totalBytes)}`);
    }
  };
}
function toMegabytes(bytes) {
  const mb = bytes / 1024 / 1024;
  return `${Math.round(mb * 10) / 10} MiB`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  downloadBrowserWithProgressBar,
  logPolitely
});

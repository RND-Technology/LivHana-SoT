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
const chunk_PXQVM7NP_exports = {};
__export(chunk_PXQVM7NP_exports, {
  allEngineEnvVarsSet: () => allEngineEnvVarsSet,
  bold: () => bold,
  deprecatedEnvVarMap: () => deprecatedEnvVarMap,
  engineEnvVarMap: () => engineEnvVarMap,
  getBinaryEnvVarPath: () => getBinaryEnvVarPath,
  yellow: () => yellow
});
module.exports = __toCommonJS(chunk_PXQVM7NP_exports);
const import_debug = __toESM(require("@prisma/debug"));
const import_fs = __toESM(require("fs"));
const import_path = __toESM(require("path"));
let FORCE_COLOR;
let NODE_DISABLE_COLORS;
let NO_COLOR;
let TERM;
let isTTY = true;
if (typeof process !== "undefined") {
  ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
  isTTY = process.stdout && process.stdout.isTTY;
}
const $ = {
  enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (FORCE_COLOR != null && FORCE_COLOR !== "0" || isTTY)
};
function init(x, y) {
  const rgx = new RegExp(`\\x1b\\[${y}m`, "g");
  const open = `\x1B[${x}m`, close = `\x1B[${y}m`;
  return function(txt) {
    if (!$.enabled || txt == null) return txt;
    return open + (~("" + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
  };
}
const reset = init(0, 0);
var bold = init(1, 22);
const dim = init(2, 22);
const italic = init(3, 23);
const underline = init(4, 24);
const inverse = init(7, 27);
const hidden = init(8, 28);
const strikethrough = init(9, 29);
const black = init(30, 39);
const red = init(31, 39);
const green = init(32, 39);
var yellow = init(33, 39);
const blue = init(34, 39);
const magenta = init(35, 39);
const cyan = init(36, 39);
const white = init(37, 39);
const gray = init(90, 39);
const grey = init(90, 39);
const bgBlack = init(40, 49);
const bgRed = init(41, 49);
const bgGreen = init(42, 49);
const bgYellow = init(43, 49);
const bgBlue = init(44, 49);
const bgMagenta = init(45, 49);
const bgCyan = init(46, 49);
const bgWhite = init(47, 49);
const debug = (0, import_debug.default)("prisma:fetch-engine:env");
var engineEnvVarMap = {
  [
    "query-engine"
    /* QueryEngineBinary */
  ]: "PRISMA_QUERY_ENGINE_BINARY",
  [
    "libquery-engine"
    /* QueryEngineLibrary */
  ]: "PRISMA_QUERY_ENGINE_LIBRARY",
  [
    "schema-engine"
    /* SchemaEngineBinary */
  ]: "PRISMA_SCHEMA_ENGINE_BINARY"
};
var deprecatedEnvVarMap = {
  [
    "schema-engine"
    /* SchemaEngineBinary */
  ]: "PRISMA_MIGRATION_ENGINE_BINARY"
};
function getBinaryEnvVarPath(binaryName) {
  const envVar = getEnvVarToUse(binaryName);
  if (process.env[envVar]) {
    const envVarPath = import_path.default.resolve(process.cwd(), process.env[envVar]);
    if (!import_fs.default.existsSync(envVarPath)) {
      throw new Error(
        `Env var ${bold(envVar)} is provided but provided path ${underline(process.env[envVar])} can't be resolved.`
      );
    }
    debug(
      `Using env var ${bold(envVar)} for binary ${bold(binaryName)}, which points to ${underline(
        process.env[envVar]
      )}`
    );
    return {
      path: envVarPath,
      fromEnvVar: envVar
    };
  }
  return null;
}
function getEnvVarToUse(binaryType) {
  const envVar = engineEnvVarMap[binaryType];
  const deprecatedEnvVar = deprecatedEnvVarMap[binaryType];
  if (deprecatedEnvVar && process.env[deprecatedEnvVar]) {
    if (process.env[envVar]) {
      console.warn(
        `${yellow("prisma:warn")} Both ${bold(envVar)} and ${bold(deprecatedEnvVar)} are specified, ${bold(
          envVar
        )} takes precedence. ${bold(deprecatedEnvVar)} is deprecated.`
      );
      return envVar;
    } else {
      console.warn(
        `${yellow("prisma:warn")} ${bold(deprecatedEnvVar)} environment variable is deprecated, please use ${bold(
          envVar
        )} instead`
      );
      return deprecatedEnvVar;
    }
  }
  return envVar;
}
function allEngineEnvVarsSet(binaries) {
  for (const binaryType of binaries) {
    if (!getBinaryEnvVarPath(binaryType)) {
      return false;
    }
  }
  return true;
}

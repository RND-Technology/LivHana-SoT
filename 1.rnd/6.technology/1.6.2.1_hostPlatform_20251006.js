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
const hostPlatform_exports = {};
__export(hostPlatform_exports, {
  hostPlatform: () => hostPlatform,
  isOfficiallySupportedPlatform: () => isOfficiallySupportedPlatform
});
module.exports = __toCommonJS(hostPlatform_exports);
const import_os = __toESM(require("os"));
const import_linuxUtils = require("./linuxUtils");
function calculatePlatform() {
  if (process.env.PLAYWRIGHT_HOST_PLATFORM_OVERRIDE) {
    return {
      hostPlatform: process.env.PLAYWRIGHT_HOST_PLATFORM_OVERRIDE,
      isOfficiallySupportedPlatform: false
    };
  }
  const platform = import_os.default.platform();
  if (platform === "darwin") {
    const ver = import_os.default.release().split(".").map((a) => parseInt(a, 10));
    let macVersion = "";
    if (ver[0] < 18) {
      macVersion = "mac10.13";
    } else if (ver[0] === 18) {
      macVersion = "mac10.14";
    } else if (ver[0] === 19) {
      macVersion = "mac10.15";
    } else {
      const LAST_STABLE_MACOS_MAJOR_VERSION = 15;
      macVersion = "mac" + Math.min(ver[0] - 9, LAST_STABLE_MACOS_MAJOR_VERSION);
      if (import_os.default.cpus().some((cpu) => cpu.model.includes("Apple")))
        macVersion += "-arm64";
    }
    return { hostPlatform: macVersion, isOfficiallySupportedPlatform: true };
  }
  if (platform === "linux") {
    if (!["x64", "arm64"].includes(import_os.default.arch()))
      return { hostPlatform: "<unknown>", isOfficiallySupportedPlatform: false };
    const archSuffix = "-" + import_os.default.arch();
    const distroInfo = (0, import_linuxUtils.getLinuxDistributionInfoSync)();
    if (distroInfo?.id === "ubuntu" || distroInfo?.id === "pop" || distroInfo?.id === "neon" || distroInfo?.id === "tuxedo") {
      const isUbuntu = distroInfo?.id === "ubuntu";
      const version = distroInfo?.version;
      const major = parseInt(distroInfo.version, 10);
      if (major < 20)
        return { hostPlatform: "ubuntu18.04" + archSuffix, isOfficiallySupportedPlatform: false };
      if (major < 22)
        return { hostPlatform: "ubuntu20.04" + archSuffix, isOfficiallySupportedPlatform: isUbuntu && version === "20.04" };
      if (major < 24)
        return { hostPlatform: "ubuntu22.04" + archSuffix, isOfficiallySupportedPlatform: isUbuntu && version === "22.04" };
      if (major < 26)
        return { hostPlatform: "ubuntu24.04" + archSuffix, isOfficiallySupportedPlatform: isUbuntu && version === "24.04" };
      return { hostPlatform: "ubuntu" + distroInfo.version + archSuffix, isOfficiallySupportedPlatform: false };
    }
    if (distroInfo?.id === "linuxmint") {
      const mintMajor = parseInt(distroInfo.version, 10);
      if (mintMajor <= 20)
        return { hostPlatform: "ubuntu20.04" + archSuffix, isOfficiallySupportedPlatform: false };
      if (mintMajor === 21)
        return { hostPlatform: "ubuntu22.04" + archSuffix, isOfficiallySupportedPlatform: false };
      return { hostPlatform: "ubuntu24.04" + archSuffix, isOfficiallySupportedPlatform: false };
    }
    if (distroInfo?.id === "debian" || distroInfo?.id === "raspbian") {
      const isOfficiallySupportedPlatform2 = distroInfo?.id === "debian";
      if (distroInfo?.version === "11")
        return { hostPlatform: "debian11" + archSuffix, isOfficiallySupportedPlatform: isOfficiallySupportedPlatform2 };
      if (distroInfo?.version === "12")
        return { hostPlatform: "debian12" + archSuffix, isOfficiallySupportedPlatform: isOfficiallySupportedPlatform2 };
      if (distroInfo?.version === "13")
        return { hostPlatform: "debian13" + archSuffix, isOfficiallySupportedPlatform: isOfficiallySupportedPlatform2 };
      if (distroInfo?.version === "")
        return { hostPlatform: "debian13" + archSuffix, isOfficiallySupportedPlatform: isOfficiallySupportedPlatform2 };
    }
    return { hostPlatform: "ubuntu20.04" + archSuffix, isOfficiallySupportedPlatform: false };
  }
  if (platform === "win32")
    return { hostPlatform: "win64", isOfficiallySupportedPlatform: true };
  return { hostPlatform: "<unknown>", isOfficiallySupportedPlatform: false };
}
const { hostPlatform, isOfficiallySupportedPlatform } = calculatePlatform();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  hostPlatform,
  isOfficiallySupportedPlatform
});

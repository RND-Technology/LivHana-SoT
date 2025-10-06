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
const clock_exports = {};
__export(clock_exports, {
  Clock: () => Clock
});
module.exports = __toCommonJS(clock_exports);
class Clock {
  constructor(browserContext) {
    this._browserContext = browserContext;
  }
  async install(options = {}) {
    await this._browserContext._channel.clockInstall(options.time !== void 0 ? parseTime(options.time) : {});
  }
  async fastForward(ticks) {
    await this._browserContext._channel.clockFastForward(parseTicks(ticks));
  }
  async pauseAt(time) {
    await this._browserContext._channel.clockPauseAt(parseTime(time));
  }
  async resume() {
    await this._browserContext._channel.clockResume({});
  }
  async runFor(ticks) {
    await this._browserContext._channel.clockRunFor(parseTicks(ticks));
  }
  async setFixedTime(time) {
    await this._browserContext._channel.clockSetFixedTime(parseTime(time));
  }
  async setSystemTime(time) {
    await this._browserContext._channel.clockSetSystemTime(parseTime(time));
  }
}
function parseTime(time) {
  if (typeof time === "number")
    return { timeNumber: time };
  if (typeof time === "string")
    return { timeString: time };
  if (!isFinite(time.getTime()))
    throw new Error(`Invalid date: ${time}`);
  return { timeNumber: time.getTime() };
}
function parseTicks(ticks) {
  return {
    ticksNumber: typeof ticks === "number" ? ticks : void 0,
    ticksString: typeof ticks === "string" ? ticks : void 0
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Clock
});

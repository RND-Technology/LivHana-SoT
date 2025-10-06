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
const chunk_4LX3XBNY_exports = {};
__export(chunk_4LX3XBNY_exports, {
  getBar: () => getBar
});
module.exports = __toCommonJS(chunk_4LX3XBNY_exports);
const import_chunk_AH6QHEOA = require("./chunk-AH6QHEOA.js");
const require_node_progress = (0, import_chunk_AH6QHEOA.__commonJS)({
  "../../node_modules/.pnpm/progress@2.0.3/node_modules/progress/lib/node-progress.js"(exports, module2) {
    "use strict";
    exports = module2.exports = ProgressBar;
    function ProgressBar(fmt, options) {
      this.stream = options.stream || process.stderr;
      if (typeof options == "number") {
        const total = options;
        options = {};
        options.total = total;
      } else {
        options = options || {};
        if ("string" != typeof fmt) throw new Error("format required");
        if ("number" != typeof options.total) throw new Error("total required");
      }
      this.fmt = fmt;
      this.curr = options.curr || 0;
      this.total = options.total;
      this.width = options.width || this.total;
      this.clear = options.clear;
      this.chars = {
        complete: options.complete || "=",
        incomplete: options.incomplete || "-",
        head: options.head || (options.complete || "=")
      };
      this.renderThrottle = options.renderThrottle !== 0 ? options.renderThrottle || 16 : 0;
      this.lastRender = -Infinity;
      this.callback = options.callback || function() {
      };
      this.tokens = {};
      this.lastDraw = "";
    }
    ProgressBar.prototype.tick = function(len, tokens) {
      if (len !== 0)
        len = len || 1;
      if ("object" == typeof len) tokens = len, len = 1;
      if (tokens) this.tokens = tokens;
      if (0 == this.curr) this.start = /* @__PURE__ */ new Date();
      this.curr += len;
      this.render();
      if (this.curr >= this.total) {
        this.render(void 0, true);
        this.complete = true;
        this.terminate();
        this.callback(this);
        return;
      }
    };
    ProgressBar.prototype.render = function(tokens, force) {
      force = force !== void 0 ? force : false;
      if (tokens) this.tokens = tokens;
      if (!this.stream.isTTY) return;
      const now = Date.now();
      const delta = now - this.lastRender;
      if (!force && delta < this.renderThrottle) {
        return;
      } else {
        this.lastRender = now;
      }
      let ratio = this.curr / this.total;
      ratio = Math.min(Math.max(ratio, 0), 1);
      const percent = Math.floor(ratio * 100);
      let incomplete, complete, completeLength;
      const elapsed = /* @__PURE__ */ new Date() - this.start;
      const eta = percent == 100 ? 0 : elapsed * (this.total / this.curr - 1);
      const rate = this.curr / (elapsed / 1e3);
      let str = this.fmt.replace(":current", this.curr).replace(":total", this.total).replace(":elapsed", isNaN(elapsed) ? "0.0" : (elapsed / 1e3).toFixed(1)).replace(":eta", isNaN(eta) || !isFinite(eta) ? "0.0" : (eta / 1e3).toFixed(1)).replace(":percent", percent.toFixed(0) + "%").replace(":rate", Math.round(rate));
      let availableSpace = Math.max(0, this.stream.columns - str.replace(":bar", "").length);
      if (availableSpace && process.platform === "win32") {
        availableSpace = availableSpace - 1;
      }
      const width = Math.min(this.width, availableSpace);
      completeLength = Math.round(width * ratio);
      complete = Array(Math.max(0, completeLength + 1)).join(this.chars.complete);
      incomplete = Array(Math.max(0, width - completeLength + 1)).join(this.chars.incomplete);
      if (completeLength > 0)
        complete = complete.slice(0, -1) + this.chars.head;
      str = str.replace(":bar", complete + incomplete);
      if (this.tokens) for (const key in this.tokens) str = str.replace(":" + key, this.tokens[key]);
      if (this.lastDraw !== str) {
        this.stream.cursorTo(0);
        this.stream.write(str);
        this.stream.clearLine(1);
        this.lastDraw = str;
      }
    };
    ProgressBar.prototype.update = function(ratio, tokens) {
      const goal = Math.floor(ratio * this.total);
      const delta = goal - this.curr;
      this.tick(delta, tokens);
    };
    ProgressBar.prototype.interrupt = function(message) {
      this.stream.clearLine();
      this.stream.cursorTo(0);
      this.stream.write(message);
      this.stream.write("\n");
      this.stream.write(this.lastDraw);
    };
    ProgressBar.prototype.terminate = function() {
      if (this.clear) {
        if (this.stream.clearLine) {
          this.stream.clearLine();
          this.stream.cursorTo(0);
        }
      } else {
        this.stream.write("\n");
      }
    };
  }
});
const require_progress = (0, import_chunk_AH6QHEOA.__commonJS)({
  "../../node_modules/.pnpm/progress@2.0.3/node_modules/progress/index.js"(exports, module2) {
    "use strict";
    module2.exports = require_node_progress();
  }
});
const import_progress = (0, import_chunk_AH6QHEOA.__toESM)(require_progress());
function getBar(text) {
  return new import_progress.default(`> ${text} [:bar] :percent`, {
    stream: process.stdout,
    width: 20,
    complete: "=",
    incomplete: " ",
    total: 100,
    head: "",
    clear: true
  });
}
/*! Bundled license information:

progress/lib/node-progress.js:
  (*!
   * node-progress
   * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
   * MIT Licensed
   *)
*/

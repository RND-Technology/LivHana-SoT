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
const chunk_YVXCXD3A_exports = {};
__export(chunk_YVXCXD3A_exports, {
  underline: () => underline,
  yellow: () => yellow
});
module.exports = __toCommonJS(chunk_YVXCXD3A_exports);
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
const bold = init(1, 22);
const dim = init(2, 22);
const italic = init(3, 23);
var underline = init(4, 24);
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

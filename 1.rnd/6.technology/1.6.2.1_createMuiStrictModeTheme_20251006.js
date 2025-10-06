"use strict";

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createMuiStrictModeTheme;
const _deepmerge = _interopRequireDefault(require("@mui/utils/deepmerge"));
const _createTheme = _interopRequireDefault(require("./createTheme"));
function createMuiStrictModeTheme(options, ...args) {
  return (0, _createTheme.default)((0, _deepmerge.default)({
    unstable_strictMode: true
  }, options), ...args);
}
"use strict";
'use client';

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useThemeProps;
const _useThemeProps = _interopRequireDefault(require("@mui/system/useThemeProps"));
const _defaultTheme = _interopRequireDefault(require("./defaultTheme"));
const _identifier = _interopRequireDefault(require("./identifier"));
function useThemeProps({
  props,
  name
}) {
  return (0, _useThemeProps.default)({
    props,
    name,
    defaultTheme: _defaultTheme.default,
    themeId: _identifier.default
  });
}
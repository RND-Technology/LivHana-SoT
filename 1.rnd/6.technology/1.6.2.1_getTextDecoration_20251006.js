"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.colorTransformations = void 0;
const _system = require("@mui/system");
const _colorManipulator = require("@mui/system/colorManipulator");
const colorTransformations = exports.colorTransformations = {
  primary: 'primary.main',
  textPrimary: 'text.primary',
  secondary: 'secondary.main',
  textSecondary: 'text.secondary',
  error: 'error.main'
};
const transformDeprecatedColors = color => {
  return colorTransformations[color] || color;
};
const getTextDecoration = ({
  theme,
  ownerState
}) => {
  const transformedColor = transformDeprecatedColors(ownerState.color);
  const color = (0, _system.getPath)(theme, `palette.${transformedColor}`, false) || ownerState.color;
  const channelColor = (0, _system.getPath)(theme, `palette.${transformedColor}Channel`);
  if ('vars' in theme && channelColor) {
    return `rgba(${channelColor} / 0.4)`;
  }
  return (0, _colorManipulator.alpha)(color, 0.4);
};
const _default = exports.default = getTextDecoration;
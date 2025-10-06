"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTooltipCSSClassName = getTooltipCSSClassName;
exports.getTooltipTranslate = getTooltipTranslate;
exports.getTooltipTranslateXY = getTooltipTranslateXY;
exports.getTransformStyle = getTransformStyle;
const _clsx = require("clsx");
const _DataUtils = require("../DataUtils");
const CSS_CLASS_PREFIX = 'recharts-tooltip-wrapper';
const TOOLTIP_HIDDEN = {
  visibility: 'hidden'
};
function getTooltipCSSClassName(_ref) {
  const {
    coordinate,
    translateX,
    translateY
  } = _ref;
  return (0, _clsx.clsx)(CSS_CLASS_PREFIX, {
    ["".concat(CSS_CLASS_PREFIX, "-right")]: (0, _DataUtils.isNumber)(translateX) && coordinate && (0, _DataUtils.isNumber)(coordinate.x) && translateX >= coordinate.x,
    ["".concat(CSS_CLASS_PREFIX, "-left")]: (0, _DataUtils.isNumber)(translateX) && coordinate && (0, _DataUtils.isNumber)(coordinate.x) && translateX < coordinate.x,
    ["".concat(CSS_CLASS_PREFIX, "-bottom")]: (0, _DataUtils.isNumber)(translateY) && coordinate && (0, _DataUtils.isNumber)(coordinate.y) && translateY >= coordinate.y,
    ["".concat(CSS_CLASS_PREFIX, "-top")]: (0, _DataUtils.isNumber)(translateY) && coordinate && (0, _DataUtils.isNumber)(coordinate.y) && translateY < coordinate.y
  });
}
function getTooltipTranslateXY(_ref2) {
  const {
    allowEscapeViewBox,
    coordinate,
    key,
    offsetTopLeft,
    position,
    reverseDirection,
    tooltipDimension,
    viewBox,
    viewBoxDimension
  } = _ref2;
  if (position && (0, _DataUtils.isNumber)(position[key])) {
    return position[key];
  }
  const negative = coordinate[key] - tooltipDimension - (offsetTopLeft > 0 ? offsetTopLeft : 0);
  const positive = coordinate[key] + offsetTopLeft;
  if (allowEscapeViewBox[key]) {
    return reverseDirection[key] ? negative : positive;
  }
  const viewBoxKey = viewBox[key];
  if (viewBoxKey == null) {
    return 0;
  }
  if (reverseDirection[key]) {
    const _tooltipBoundary = negative;
    const _viewBoxBoundary = viewBoxKey;
    if (_tooltipBoundary < _viewBoxBoundary) {
      return Math.max(positive, viewBoxKey);
    }
    return Math.max(negative, viewBoxKey);
  }
  if (viewBoxDimension == null) {
    return 0;
  }
  const tooltipBoundary = positive + tooltipDimension;
  const viewBoxBoundary = viewBoxKey + viewBoxDimension;
  if (tooltipBoundary > viewBoxBoundary) {
    return Math.max(negative, viewBoxKey);
  }
  return Math.max(positive, viewBoxKey);
}
function getTransformStyle(_ref3) {
  const {
    translateX,
    translateY,
    useTranslate3d
  } = _ref3;
  return {
    transform: useTranslate3d ? "translate3d(".concat(translateX, "px, ").concat(translateY, "px, 0)") : "translate(".concat(translateX, "px, ").concat(translateY, "px)")
  };
}
function getTooltipTranslate(_ref4) {
  const {
    allowEscapeViewBox,
    coordinate,
    offsetTopLeft,
    position,
    reverseDirection,
    tooltipBox,
    useTranslate3d,
    viewBox
  } = _ref4;
  let cssProperties, translateX, translateY;
  if (tooltipBox.height > 0 && tooltipBox.width > 0 && coordinate) {
    translateX = getTooltipTranslateXY({
      allowEscapeViewBox,
      coordinate,
      key: 'x',
      offsetTopLeft,
      position,
      reverseDirection,
      tooltipDimension: tooltipBox.width,
      viewBox,
      viewBoxDimension: viewBox.width
    });
    translateY = getTooltipTranslateXY({
      allowEscapeViewBox,
      coordinate,
      key: 'y',
      offsetTopLeft,
      position,
      reverseDirection,
      tooltipDimension: tooltipBox.height,
      viewBox,
      viewBoxDimension: viewBox.height
    });
    cssProperties = getTransformStyle({
      translateX,
      translateY,
      useTranslate3d
    });
  } else {
    cssProperties = TOOLTIP_HIDDEN;
  }
  return {
    cssProperties,
    cssClasses: getTooltipCSSClassName({
      translateX,
      translateY,
      coordinate
    })
  };
}
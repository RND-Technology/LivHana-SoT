import { top, left, right, bottom, start } from "../enums.js";
import getBasePlacement from "../utils/getBasePlacement.js";
import getMainAxisFromPlacement from "../utils/getMainAxisFromPlacement.js";
import getAltAxis from "../utils/getAltAxis.js";
import { within, withinMaxClamp } from "../utils/within.js";
import getLayoutRect from "../dom-utils/getLayoutRect.js";
import getOffsetParent from "../dom-utils/getOffsetParent.js";
import detectOverflow from "../utils/detectOverflow.js";
import getVariation from "../utils/getVariation.js";
import getFreshSideObject from "../utils/getFreshSideObject.js";
import { min as mathMin, max as mathMax } from "../utils/math.js";

function preventOverflow(_ref) {
  const state = _ref.state,
      options = _ref.options,
      name = _ref.name;
  const _options$mainAxis = options.mainAxis,
      checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
      _options$altAxis = options.altAxis,
      checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      padding = options.padding,
      _options$tether = options.tether,
      tether = _options$tether === void 0 ? true : _options$tether,
      _options$tetherOffset = options.tetherOffset,
      tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
  const overflow = detectOverflow(state, {
    boundary: boundary,
    rootBoundary: rootBoundary,
    padding: padding,
    altBoundary: altBoundary
  });
  const basePlacement = getBasePlacement(state.placement);
  const variation = getVariation(state.placement);
  const isBasePlacement = !variation;
  const mainAxis = getMainAxisFromPlacement(basePlacement);
  const altAxis = getAltAxis(mainAxis);
  const popperOffsets = state.modifiersData.popperOffsets;
  const referenceRect = state.rects.reference;
  const popperRect = state.rects.popper;
  const tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset(Object.assign({}, state.rects, {
    placement: state.placement
  })) : tetherOffset;
  const normalizedTetherOffsetValue = typeof tetherOffsetValue === 'number' ? {
    mainAxis: tetherOffsetValue,
    altAxis: tetherOffsetValue
  } : Object.assign({
    mainAxis: 0,
    altAxis: 0
  }, tetherOffsetValue);
  const offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
  const data = {
    x: 0,
    y: 0
  };

  if (!popperOffsets) {
    return;
  }

  if (checkMainAxis) {
    let _offsetModifierState$;

    const mainSide = mainAxis === 'y' ? top : left;
    const altSide = mainAxis === 'y' ? bottom : right;
    const len = mainAxis === 'y' ? 'height' : 'width';
    const offset = popperOffsets[mainAxis];
    const min = offset + overflow[mainSide];
    const max = offset - overflow[altSide];
    const additive = tether ? -popperRect[len] / 2 : 0;
    const minLen = variation === start ? referenceRect[len] : popperRect[len];
    const maxLen = variation === start ? -popperRect[len] : -referenceRect[len]; // We need to include the arrow in the calculation so the arrow doesn't go
    // outside the reference bounds

    const arrowElement = state.elements.arrow;
    const arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
      width: 0,
      height: 0
    };
    const arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
    const arrowPaddingMin = arrowPaddingObject[mainSide];
    const arrowPaddingMax = arrowPaddingObject[altSide]; // If the reference length is smaller than the arrow length, we don't want
    // to include its full size in the calculation. If the reference is small
    // and near the edge of a boundary, the popper can overflow even if the
    // reference is not overflowing as well (e.g. virtual elements with no
    // width or height)

    const arrowLen = within(0, referenceRect[len], arrowRect[len]);
    const minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
    const maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
    const arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
    const clientOffset = arrowOffsetParent ? mainAxis === 'y' ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
    const offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
    const tetherMin = offset + minOffset - offsetModifierValue - clientOffset;
    const tetherMax = offset + maxOffset - offsetModifierValue;
    const preventedOffset = within(tether ? mathMin(min, tetherMin) : min, offset, tether ? mathMax(max, tetherMax) : max);
    popperOffsets[mainAxis] = preventedOffset;
    data[mainAxis] = preventedOffset - offset;
  }

  if (checkAltAxis) {
    let _offsetModifierState$2;

    const _mainSide = mainAxis === 'x' ? top : left;

    const _altSide = mainAxis === 'x' ? bottom : right;

    const _offset = popperOffsets[altAxis];

    const _len = altAxis === 'y' ? 'height' : 'width';

    const _min = _offset + overflow[_mainSide];

    const _max = _offset - overflow[_altSide];

    const isOriginSide = [top, left].indexOf(basePlacement) !== -1;

    const _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;

    const _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;

    const _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;

    const _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);

    popperOffsets[altAxis] = _preventedOffset;
    data[altAxis] = _preventedOffset - _offset;
  }

  state.modifiersData[name] = data;
} // eslint-disable-next-line import/no-unused-modules


export default {
  name: 'preventOverflow',
  enabled: true,
  phase: 'main',
  fn: preventOverflow,
  requiresIfExists: ['offset']
};
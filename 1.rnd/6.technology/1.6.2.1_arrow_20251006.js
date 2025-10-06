import getBasePlacement from "../utils/getBasePlacement.js";
import getLayoutRect from "../dom-utils/getLayoutRect.js";
import contains from "../dom-utils/contains.js";
import getOffsetParent from "../dom-utils/getOffsetParent.js";
import getMainAxisFromPlacement from "../utils/getMainAxisFromPlacement.js";
import { within } from "../utils/within.js";
import mergePaddingObject from "../utils/mergePaddingObject.js";
import expandToHashMap from "../utils/expandToHashMap.js";
import { left, right, basePlacements, top, bottom } from "../enums.js"; // eslint-disable-next-line import/no-unused-modules

const toPaddingObject = function toPaddingObject(padding, state) {
  padding = typeof padding === 'function' ? padding(Object.assign({}, state.rects, {
    placement: state.placement
  })) : padding;
  return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
};

function arrow(_ref) {
  let _state$modifiersData$;

  const state = _ref.state,
      name = _ref.name,
      options = _ref.options;
  const arrowElement = state.elements.arrow;
  const popperOffsets = state.modifiersData.popperOffsets;
  const basePlacement = getBasePlacement(state.placement);
  const axis = getMainAxisFromPlacement(basePlacement);
  const isVertical = [left, right].indexOf(basePlacement) >= 0;
  const len = isVertical ? 'height' : 'width';

  if (!arrowElement || !popperOffsets) {
    return;
  }

  const paddingObject = toPaddingObject(options.padding, state);
  const arrowRect = getLayoutRect(arrowElement);
  const minProp = axis === 'y' ? top : left;
  const maxProp = axis === 'y' ? bottom : right;
  const endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
  const startDiff = popperOffsets[axis] - state.rects.reference[axis];
  const arrowOffsetParent = getOffsetParent(arrowElement);
  const clientSize = arrowOffsetParent ? axis === 'y' ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
  const centerToReference = endDiff / 2 - startDiff / 2; // Make sure the arrow doesn't overflow the popper if the center point is
  // outside of the popper bounds

  const min = paddingObject[minProp];
  const max = clientSize - arrowRect[len] - paddingObject[maxProp];
  const center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
  const offset = within(min, center, max); // Prevents breaking syntax highlighting...

  const axisProp = axis;
  state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
}

function effect(_ref2) {
  const state = _ref2.state,
      options = _ref2.options;
  let _options$element = options.element,
      arrowElement = _options$element === void 0 ? '[data-popper-arrow]' : _options$element;

  if (arrowElement == null) {
    return;
  } // CSS selector


  if (typeof arrowElement === 'string') {
    arrowElement = state.elements.popper.querySelector(arrowElement);

    if (!arrowElement) {
      return;
    }
  }

  if (!contains(state.elements.popper, arrowElement)) {
    return;
  }

  state.elements.arrow = arrowElement;
} // eslint-disable-next-line import/no-unused-modules


export default {
  name: 'arrow',
  enabled: true,
  phase: 'main',
  fn: arrow,
  effect: effect,
  requires: ['popperOffsets'],
  requiresIfExists: ['preventOverflow']
};
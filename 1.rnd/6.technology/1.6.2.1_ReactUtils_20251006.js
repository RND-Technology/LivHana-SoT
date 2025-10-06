"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filterProps = exports.SCALE_TYPES = void 0;
exports.findAllByType = findAllByType;
exports.toArray = exports.isValidSpreadableProp = exports.isClipDot = exports.getDisplayName = void 0;
const _get = _interopRequireDefault(require("es-toolkit/compat/get"));
const _react = require("react");
const _reactIs = require("react-is");
const _DataUtils = require("./DataUtils");
const _types = require("./types");
const _excludeEventProps = require("./excludeEventProps");
const _svgPropertiesNoEvents = require("./svgPropertiesNoEvents");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const SCALE_TYPES = exports.SCALE_TYPES = ['auto', 'linear', 'pow', 'sqrt', 'log', 'identity', 'time', 'band', 'point', 'ordinal', 'quantile', 'quantize', 'utc', 'sequential', 'threshold'];

/**
 * @deprecated instead find another approach that does not depend on displayName.
 * Get the display name of a component
 * @param  {Object} Comp Specified Component
 * @return {String}      Display name of Component
 */
const getDisplayName = Comp => {
  if (typeof Comp === 'string') {
    return Comp;
  }
  if (!Comp) {
    return '';
  }
  return Comp.displayName || Comp.name || 'Component';
};

// `toArray` gets called multiple times during the render
// so we can memoize last invocation (since reference to `children` is the same)
exports.getDisplayName = getDisplayName;
let lastChildren = null;
let lastResult = null;

/**
 * @deprecated instead find another approach that does not require reading React Elements from DOM.
 *
 * @param children do not use
 * @return deprecated do not use
 */
const toArray = children => {
  if (children === lastChildren && Array.isArray(lastResult)) {
    return lastResult;
  }
  let result = [];
  _react.Children.forEach(children, child => {
    if ((0, _DataUtils.isNullish)(child)) return;
    if ((0, _reactIs.isFragment)(child)) {
      result = result.concat(toArray(child.props.children));
    } else {
      // @ts-expect-error this could still be Iterable<ReactNode> and TS does not like that
      result.push(child);
    }
  });
  lastResult = result;
  lastChildren = children;
  return result;
};

/**
 * @deprecated instead find another approach that does not require reading React Elements from DOM.
 *
 * Find and return all matched children by type.
 * `type` must be a React.ComponentType
 *
 * @param children do not use
 * @param type do not use
 * @return deprecated do not use
 */
exports.toArray = toArray;
function findAllByType(children, type) {
  const result = [];
  let types = [];
  if (Array.isArray(type)) {
    types = type.map(t => getDisplayName(t));
  } else {
    types = [getDisplayName(type)];
  }
  toArray(children).forEach(child => {
    const childType = (0, _get.default)(child, 'type.displayName') || (0, _get.default)(child, 'type.name');
    // ts-expect-error toArray and lodash.get are not compatible. Let's get rid of the whole findAllByType function
    if (types.indexOf(childType) !== -1) {
      result.push(child);
    }
  });
  return result;
}
const isClipDot = dot => {
  if (dot && typeof dot === 'object' && 'clipDot' in dot) {
    return Boolean(dot.clipDot);
  }
  return true;
};

/**
 * Checks if the property is valid to spread onto an SVG element or onto a specific component
 * @param {unknown} property property value currently being compared
 * @param {string} key property key currently being compared
 * @param {boolean} includeEvents if events are included in spreadable props
 * @param {boolean} svgElementType checks against map of SVG element types to attributes
 * @returns {boolean} is prop valid
 */
exports.isClipDot = isClipDot;
const isValidSpreadableProp = (property, key, includeEvents, svgElementType) => {
  let _ref;
  if (typeof key === 'symbol' || typeof key === 'number') {
    // Allow symbols and numbers as valid keys
    return true;
  }
  /**
   * If the svg element type is explicitly included, check against the filtered element key map
   * to determine if there are attributes that should only exist on that element type.
   * @todo Add an internal cjs version of https://github.com/wooorm/svg-element-attributes for full coverage.
   */
  const matchingElementTypeKeys = (_ref = svgElementType && (_types.FilteredElementKeyMap === null || _types.FilteredElementKeyMap === void 0 ? void 0 : _types.FilteredElementKeyMap[svgElementType])) !== null && _ref !== void 0 ? _ref : [];
  const isDataAttribute = key.startsWith('data-');
  const isSpecificSvgAttribute = typeof property !== 'function' && (Boolean(svgElementType) && matchingElementTypeKeys.includes(key) || (0, _svgPropertiesNoEvents.isSvgElementPropKey)(key));
  const isEventAttribute = Boolean(includeEvents) && (0, _excludeEventProps.isEventKey)(key);
  return isDataAttribute || isSpecificSvgAttribute || isEventAttribute;
};

/**
 * Filters the props object to only include valid SVG attributes or event handlers.
 * @deprecated do not use this function, as it is not type-safe and may lead to unexpected behavior. Returns `any`.
 * Instead, use:
 * - `excludeEventProps` to exclude event handlers
 * - `svgPropertiesNoEvents` to exclude non-SVG attributes, and exclude event handlers too
 * @param props - The props object to filter, which can be a Record, Component, FunctionComponent, boolean, or unknown.
 * @param includeEvents - A boolean indicating whether to include event handlers in the filtered props.
 * @param svgElementType - An optional parameter specifying the type of SVG element to filter attributes for.
 * @returns A new object containing only valid SVG attributes or event handlers, or null if the input is not valid.
 */
exports.isValidSpreadableProp = isValidSpreadableProp;
const filterProps = (props, includeEvents, svgElementType) => {
  if (!props || typeof props === 'function' || typeof props === 'boolean') {
    return null;
  }
  let inputProps = props;
  if (/*#__PURE__*/(0, _react.isValidElement)(props)) {
    inputProps = props.props;
  }
  if (typeof inputProps !== 'object' && typeof inputProps !== 'function') {
    return null;
  }
  const out = {};

  /**
   * Props are blindly spread onto SVG elements. This loop filters out properties that we don't want to spread.
   * Items filtered out are as follows:
   *   - functions in properties that are SVG attributes (functions are included when includeEvents is true)
   *   - props that are SVG attributes but don't matched the passed svgElementType
   *   - any prop that is not in SVGElementPropKeys (or in EventKeys if includeEvents is true)
   */
  Object.keys(inputProps).forEach(key => {
    let _inputProps;
    if (isValidSpreadableProp((_inputProps = inputProps) === null || _inputProps === void 0 ? void 0 : _inputProps[key], key, includeEvents, svgElementType)) {
      out[key] = inputProps[key];
    }
  });
  return out;
};
exports.filterProps = filterProps;
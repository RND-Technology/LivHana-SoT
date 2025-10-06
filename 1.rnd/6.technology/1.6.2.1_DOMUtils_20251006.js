"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTextMeasurementConfig = exports.getStringSize = exports.getStringCacheStats = exports.configureTextMeasurement = exports.clearStringCache = void 0;
const _Global = require("./Global");
const _LRUCache = require("./LRUCache");
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const defaultConfig = {
  cacheSize: 2000,
  enableCache: true
};
let currentConfig = _objectSpread({}, defaultConfig);
let stringCache = new _LRUCache.LRUCache(currentConfig.cacheSize);
const SPAN_STYLE = {
  position: 'absolute',
  top: '-20000px',
  left: 0,
  padding: 0,
  margin: 0,
  border: 'none',
  whiteSpace: 'pre'
};
const MEASUREMENT_SPAN_ID = 'recharts_measurement_span';
function createCacheKey(text, style) {
  // Simple string concatenation for better performance than JSON.stringify
  const fontSize = style.fontSize || '';
  const fontFamily = style.fontFamily || '';
  const fontWeight = style.fontWeight || '';
  const fontStyle = style.fontStyle || '';
  const letterSpacing = style.letterSpacing || '';
  const textTransform = style.textTransform || '';
  return "".concat(text, "|").concat(fontSize, "|").concat(fontFamily, "|").concat(fontWeight, "|").concat(fontStyle, "|").concat(letterSpacing, "|").concat(textTransform);
}

/**
 * Measure text using DOM (accurate but slower)
 * @param text - The text to measure
 * @param style - CSS style properties to apply
 * @returns The size of the text
 */
const measureTextWithDOM = (text, style) => {
  try {
    let measurementSpan = document.getElementById(MEASUREMENT_SPAN_ID);
    if (!measurementSpan) {
      measurementSpan = document.createElement('span');
      measurementSpan.setAttribute('id', MEASUREMENT_SPAN_ID);
      measurementSpan.setAttribute('aria-hidden', 'true');
      document.body.appendChild(measurementSpan);
    }

    // Apply styles directly without unnecessary object creation
    Object.assign(measurementSpan.style, SPAN_STYLE, style);
    measurementSpan.textContent = "".concat(text);
    const rect = measurementSpan.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height
    };
  } catch (_unused) {
    return {
      width: 0,
      height: 0
    };
  }
};
const getStringSize = exports.getStringSize = function getStringSize(text) {
  const style = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (text === undefined || text === null || _Global.Global.isSsr) {
    return {
      width: 0,
      height: 0
    };
  }

  // If caching is disabled, measure directly
  if (!currentConfig.enableCache) {
    return measureTextWithDOM(text, style);
  }
  const cacheKey = createCacheKey(text, style);
  const cachedResult = stringCache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  // Measure using DOM
  const result = measureTextWithDOM(text, style);

  // Store in LRU cache
  stringCache.set(cacheKey, result);
  return result;
};

/**
 * Configure text measurement behavior
 * @param config - Partial configuration to apply
 * @returns void
 */
const configureTextMeasurement = config => {
  const newConfig = _objectSpread(_objectSpread({}, currentConfig), config);
  if (newConfig.cacheSize !== currentConfig.cacheSize) {
    stringCache = new _LRUCache.LRUCache(newConfig.cacheSize);
  }
  currentConfig = newConfig;
};

/**
 * Get current text measurement configuration
 * @returns Current configuration
 */
exports.configureTextMeasurement = configureTextMeasurement;
const getTextMeasurementConfig = () => _objectSpread({}, currentConfig);

/**
 * Clear the string size cache. Useful for testing or memory management.
 * @returns void
 */
exports.getTextMeasurementConfig = getTextMeasurementConfig;
const clearStringCache = () => {
  stringCache.clear();
};

/**
 * Get cache statistics for debugging purposes.
 * @returns Cache statistics including size and max size
 */
exports.clearStringCache = clearStringCache;
const getStringCacheStats = () => ({
  size: stringCache.size(),
  maxSize: currentConfig.cacheSize
});
exports.getStringCacheStats = getStringCacheStats;
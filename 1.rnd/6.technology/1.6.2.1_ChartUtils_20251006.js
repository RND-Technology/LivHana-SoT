"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCateCoordinateOfBar = exports.getBaseValueOfBar = exports.getBandSizeOfAxis = exports.getActiveCoordinate = exports.checkDomainOfScale = exports.calculateTooltipPos = exports.calculateActiveTickIndex = exports.appendOffsetOfLegend = exports.MIN_VALUE_REG = exports.MAX_VALUE_REG = void 0;
exports.getCateCoordinateOfLine = getCateCoordinateOfLine;
exports.getDomainOfStackGroups = exports.getCoordinatesOfGrid = void 0;
exports.getNormalizedStackId = getNormalizedStackId;
exports.getTicksOfAxis = exports.getStackedData = void 0;
exports.getTooltipEntry = getTooltipEntry;
exports.getTooltipNameProp = getTooltipNameProp;
exports.getValueByDataKey = getValueByDataKey;
exports.inRange = inRange;
exports.truncateByDomain = exports.offsetSign = exports.offsetPositive = exports.isCategoricalAxis = void 0;
const _sortBy = _interopRequireDefault(require("es-toolkit/compat/sortBy"));
const _get = _interopRequireDefault(require("es-toolkit/compat/get"));
const _d3Shape = require("victory-vendor/d3-shape");
const _DataUtils = require("./DataUtils");
const _PolarUtils = require("./PolarUtils");
const _getSliced = require("./getSliced");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function getValueByDataKey(obj, dataKey, defaultValue) {
  if ((0, _DataUtils.isNullish)(obj) || (0, _DataUtils.isNullish)(dataKey)) {
    return defaultValue;
  }
  if ((0, _DataUtils.isNumOrStr)(dataKey)) {
    return (0, _get.default)(obj, dataKey, defaultValue);
  }
  if (typeof dataKey === 'function') {
    return dataKey(obj);
  }
  return defaultValue;
}
const calculateActiveTickIndex = (coordinate, ticks, unsortedTicks, axisType, range) => {
  let _ticks$length;
  let index = -1;
  const len = (_ticks$length = ticks === null || ticks === void 0 ? void 0 : ticks.length) !== null && _ticks$length !== void 0 ? _ticks$length : 0;

  // if there are 1 or fewer ticks or if there is no coordinate then the active tick is at index 0
  if (len <= 1 || coordinate == null) {
    return 0;
  }
  if (axisType === 'angleAxis' && range != null && Math.abs(Math.abs(range[1] - range[0]) - 360) <= 1e-6) {
    // ticks are distributed in a circle
    for (let i = 0; i < len; i++) {
      const before = i > 0 ? unsortedTicks[i - 1].coordinate : unsortedTicks[len - 1].coordinate;
      const cur = unsortedTicks[i].coordinate;
      const after = i >= len - 1 ? unsortedTicks[0].coordinate : unsortedTicks[i + 1].coordinate;
      let sameDirectionCoord = void 0;
      if ((0, _DataUtils.mathSign)(cur - before) !== (0, _DataUtils.mathSign)(after - cur)) {
        const diffInterval = [];
        if ((0, _DataUtils.mathSign)(after - cur) === (0, _DataUtils.mathSign)(range[1] - range[0])) {
          sameDirectionCoord = after;
          const curInRange = cur + range[1] - range[0];
          diffInterval[0] = Math.min(curInRange, (curInRange + before) / 2);
          diffInterval[1] = Math.max(curInRange, (curInRange + before) / 2);
        } else {
          sameDirectionCoord = before;
          const afterInRange = after + range[1] - range[0];
          diffInterval[0] = Math.min(cur, (afterInRange + cur) / 2);
          diffInterval[1] = Math.max(cur, (afterInRange + cur) / 2);
        }
        const sameInterval = [Math.min(cur, (sameDirectionCoord + cur) / 2), Math.max(cur, (sameDirectionCoord + cur) / 2)];
        if (coordinate > sameInterval[0] && coordinate <= sameInterval[1] || coordinate >= diffInterval[0] && coordinate <= diffInterval[1]) {
          ({
            index
          } = unsortedTicks[i]);
          break;
        }
      } else {
        const minValue = Math.min(before, after);
        const maxValue = Math.max(before, after);
        if (coordinate > (minValue + cur) / 2 && coordinate <= (maxValue + cur) / 2) {
          ({
            index
          } = unsortedTicks[i]);
          break;
        }
      }
    }
  } else if (ticks) {
    // ticks are distributed in a single direction
    for (let _i = 0; _i < len; _i++) {
      if (_i === 0 && coordinate <= (ticks[_i].coordinate + ticks[_i + 1].coordinate) / 2 || _i > 0 && _i < len - 1 && coordinate > (ticks[_i].coordinate + ticks[_i - 1].coordinate) / 2 && coordinate <= (ticks[_i].coordinate + ticks[_i + 1].coordinate) / 2 || _i === len - 1 && coordinate > (ticks[_i].coordinate + ticks[_i - 1].coordinate) / 2) {
        ({
          index
        } = ticks[_i]);
        break;
      }
    }
  }
  return index;
};
exports.calculateActiveTickIndex = calculateActiveTickIndex;
const appendOffsetOfLegend = (offset, legendSettings, legendSize) => {
  if (legendSettings && legendSize) {
    const {
      width: boxWidth,
      height: boxHeight
    } = legendSize;
    const {
      align,
      verticalAlign,
      layout
    } = legendSettings;
    if ((layout === 'vertical' || layout === 'horizontal' && verticalAlign === 'middle') && align !== 'center' && (0, _DataUtils.isNumber)(offset[align])) {
      return _objectSpread(_objectSpread({}, offset), {}, {
        [align]: offset[align] + (boxWidth || 0)
      });
    }
    if ((layout === 'horizontal' || layout === 'vertical' && align === 'center') && verticalAlign !== 'middle' && (0, _DataUtils.isNumber)(offset[verticalAlign])) {
      return _objectSpread(_objectSpread({}, offset), {}, {
        [verticalAlign]: offset[verticalAlign] + (boxHeight || 0)
      });
    }
  }
  return offset;
};
exports.appendOffsetOfLegend = appendOffsetOfLegend;
const isCategoricalAxis = (layout, axisType) => layout === 'horizontal' && axisType === 'xAxis' || layout === 'vertical' && axisType === 'yAxis' || layout === 'centric' && axisType === 'angleAxis' || layout === 'radial' && axisType === 'radiusAxis';

/**
 * Calculate the Coordinates of grid
 * @param  {Array} ticks           The ticks in axis
 * @param {Number} minValue        The minimum value of axis
 * @param {Number} maxValue        The maximum value of axis
 * @param {boolean} syncWithTicks  Synchronize grid lines with ticks or not
 * @return {Array}                 Coordinates
 */
exports.isCategoricalAxis = isCategoricalAxis;
const getCoordinatesOfGrid = (ticks, minValue, maxValue, syncWithTicks) => {
  if (syncWithTicks) {
    return ticks.map(entry => entry.coordinate);
  }
  let hasMin, hasMax;
  const values = ticks.map(entry => {
    if (entry.coordinate === minValue) {
      hasMin = true;
    }
    if (entry.coordinate === maxValue) {
      hasMax = true;
    }
    return entry.coordinate;
  });
  if (!hasMin) {
    values.push(minValue);
  }
  if (!hasMax) {
    values.push(maxValue);
  }
  return values;
};

/**
 * A subset of d3-scale that Recharts is using
 */
exports.getCoordinatesOfGrid = getCoordinatesOfGrid;
/**
 * Get the ticks of an axis
 * @param  {Object}  axis The configuration of an axis
 * @param {Boolean} isGrid Whether or not are the ticks in grid
 * @param {Boolean} isAll Return the ticks of all the points or not
 * @return {Array}  Ticks
 */
const getTicksOfAxis = (axis, isGrid, isAll) => {
  if (!axis) {
    return null;
  }
  const {
    duplicateDomain,
    type,
    range,
    scale,
    realScaleType,
    isCategorical,
    categoricalDomain,
    tickCount,
    ticks,
    niceTicks,
    axisType
  } = axis;
  if (!scale) {
    return null;
  }
  const offsetForBand = realScaleType === 'scaleBand' && scale.bandwidth ? scale.bandwidth() / 2 : 2;
  let offset = (isGrid || isAll) && type === 'category' && scale.bandwidth ? scale.bandwidth() / offsetForBand : 0;
  offset = axisType === 'angleAxis' && range && range.length >= 2 ? (0, _DataUtils.mathSign)(range[0] - range[1]) * 2 * offset : offset;

  // The ticks set by user should only affect the ticks adjacent to axis line
  if (isGrid && (ticks || niceTicks)) {
    const result = (ticks || niceTicks || []).map((entry, index) => {
      const scaleContent = duplicateDomain ? duplicateDomain.indexOf(entry) : entry;
      return {
        // If the scaleContent is not a number, the coordinate will be NaN.
        // That could be the case for example with a PointScale and a string as domain.
        coordinate: scale(scaleContent) + offset,
        value: entry,
        offset,
        index
      };
    });
    return result.filter(row => !(0, _DataUtils.isNan)(row.coordinate));
  }

  // When axis is a categorical axis, but the type of axis is number or the scale of axis is not "auto"
  if (isCategorical && categoricalDomain) {
    return categoricalDomain.map((entry, index) => ({
      coordinate: scale(entry) + offset,
      value: entry,
      index,
      offset
    }));
  }
  if (scale.ticks && !isAll && tickCount != null) {
    return scale.ticks(tickCount).map((entry, index) => ({
      coordinate: scale(entry) + offset,
      value: entry,
      offset,
      index
    }));
  }

  // When axis has duplicated text, serial numbers are used to generate scale
  return scale.domain().map((entry, index) => ({
    coordinate: scale(entry) + offset,
    value: duplicateDomain ? duplicateDomain[entry] : entry,
    index,
    offset
  }));
};
exports.getTicksOfAxis = getTicksOfAxis;
const EPS = 1e-4;
const checkDomainOfScale = scale => {
  const domain = scale.domain();
  if (!domain || domain.length <= 2) {
    return;
  }
  const len = domain.length;
  const range = scale.range();
  const minValue = Math.min(range[0], range[1]) - EPS;
  const maxValue = Math.max(range[0], range[1]) + EPS;
  const first = scale(domain[0]);
  const last = scale(domain[len - 1]);
  if (first < minValue || first > maxValue || last < minValue || last > maxValue) {
    scale.domain([domain[0], domain[len - 1]]);
  }
};

/**
 * Both value and domain are tuples of two numbers
 * - but the type stays as array of numbers until we have better support in rest of the app
 * @param value input that will be truncated
 * @param domain boundaries
 * @returns tuple of two numbers
 */
exports.checkDomainOfScale = checkDomainOfScale;
const truncateByDomain = (value, domain) => {
  if (!domain || domain.length !== 2 || !(0, _DataUtils.isNumber)(domain[0]) || !(0, _DataUtils.isNumber)(domain[1])) {
    return value;
  }
  const minValue = Math.min(domain[0], domain[1]);
  const maxValue = Math.max(domain[0], domain[1]);
  const result = [value[0], value[1]];
  if (!(0, _DataUtils.isNumber)(value[0]) || value[0] < minValue) {
    result[0] = minValue;
  }
  if (!(0, _DataUtils.isNumber)(value[1]) || value[1] > maxValue) {
    result[1] = maxValue;
  }
  if (result[0] > maxValue) {
    result[0] = maxValue;
  }
  if (result[1] < minValue) {
    result[1] = minValue;
  }
  return result;
};

/**
 * Stacks all positive numbers above zero and all negative numbers below zero.
 *
 * If all values in the series are positive then this behaves the same as 'none' stacker.
 *
 * @param {Array} series from d3-shape Stack
 * @return {Array} series with applied offset
 */
exports.truncateByDomain = truncateByDomain;
const offsetSign = series => {
  const n = series.length;
  if (n <= 0) {
    return;
  }
  for (let j = 0, m = series[0].length; j < m; ++j) {
    let positive = 0;
    let negative = 0;
    for (let i = 0; i < n; ++i) {
      const value = (0, _DataUtils.isNan)(series[i][j][1]) ? series[i][j][0] : series[i][j][1];

      /* eslint-disable prefer-destructuring, no-param-reassign */
      if (value >= 0) {
        series[i][j][0] = positive;
        series[i][j][1] = positive + value;
        positive = series[i][j][1];
      } else {
        series[i][j][0] = negative;
        series[i][j][1] = negative + value;
        negative = series[i][j][1];
      }
      /* eslint-enable prefer-destructuring, no-param-reassign */
    }
  }
};

/**
 * Replaces all negative values with zero when stacking data.
 *
 * If all values in the series are positive then this behaves the same as 'none' stacker.
 *
 * @param {Array} series from d3-shape Stack
 * @return {Array} series with applied offset
 */
exports.offsetSign = offsetSign;
const offsetPositive = series => {
  const n = series.length;
  if (n <= 0) {
    return;
  }
  for (let j = 0, m = series[0].length; j < m; ++j) {
    let positive = 0;
    for (let i = 0; i < n; ++i) {
      const value = (0, _DataUtils.isNan)(series[i][j][1]) ? series[i][j][0] : series[i][j][1];

      /* eslint-disable prefer-destructuring, no-param-reassign */
      if (value >= 0) {
        series[i][j][0] = positive;
        series[i][j][1] = positive + value;
        positive = series[i][j][1];
      } else {
        series[i][j][0] = 0;
        series[i][j][1] = 0;
      }
      /* eslint-enable prefer-destructuring, no-param-reassign */
    }
  }
};

/**
 * Function type to compute offset for stacked data.
 *
 * d3-shape has something fishy going on with its types.
 * In @definitelytyped/d3-shape, this function (the offset accessor) is typed as Series<> => void.
 * However! When I actually open the storybook I can see that the offset accessor actually receives Array<Series<>>.
 * The same I can see in the source code itself:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/66042
 * That one unfortunately has no types but we can tell it passes three-dimensional array.
 *
 * Which leads me to believe that definitelytyped is wrong on this one.
 * There's open discussion on this topic without much attention:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/66042
 */
exports.offsetPositive = offsetPositive;
const STACK_OFFSET_MAP = {
  sign: offsetSign,
  // @ts-expect-error definitelytyped types are incorrect
  expand: _d3Shape.stackOffsetExpand,
  // @ts-expect-error definitelytyped types are incorrect
  none: _d3Shape.stackOffsetNone,
  // @ts-expect-error definitelytyped types are incorrect
  silhouette: _d3Shape.stackOffsetSilhouette,
  // @ts-expect-error definitelytyped types are incorrect
  wiggle: _d3Shape.stackOffsetWiggle,
  positive: offsetPositive
};
const getStackedData = (data, dataKeys, offsetType) => {
  const offsetAccessor = STACK_OFFSET_MAP[offsetType];
  const stack = (0, _d3Shape.stack)().keys(dataKeys).value((d, key) => +getValueByDataKey(d, key, 0)).order(_d3Shape.stackOrderNone)
  // @ts-expect-error definitelytyped types are incorrect
  .offset(offsetAccessor);
  return stack(data);
};

/**
 * Stack IDs in the external props allow numbers; but internally we use it as an object key
 * and object keys are always strings. Also, it would be kinda confusing if stackId=8 and stackId='8' were different stacks
 * so let's just force a string.
 */
exports.getStackedData = getStackedData;
function getNormalizedStackId(publicStackId) {
  return publicStackId == null ? undefined : String(publicStackId);
}
function getCateCoordinateOfLine(_ref) {
  const {
    axis,
    ticks,
    bandSize,
    entry,
    index,
    dataKey
  } = _ref;
  if (axis.type === 'category') {
    // find coordinate of category axis by the value of category
    // @ts-expect-error why does this use direct object access instead of getValueByDataKey?
    if (!axis.allowDuplicatedCategory && axis.dataKey && !(0, _DataUtils.isNullish)(entry[axis.dataKey])) {
      // @ts-expect-error why does this use direct object access instead of getValueByDataKey?
      const matchedTick = (0, _DataUtils.findEntryInArray)(ticks, 'value', entry[axis.dataKey]);
      if (matchedTick) {
        return matchedTick.coordinate + bandSize / 2;
      }
    }
    return ticks[index] ? ticks[index].coordinate + bandSize / 2 : null;
  }
  const value = getValueByDataKey(entry, !(0, _DataUtils.isNullish)(dataKey) ? dataKey : axis.dataKey);

  // @ts-expect-error getValueByDataKey does not validate the output type
  return !(0, _DataUtils.isNullish)(value) ? axis.scale(value) : null;
}
const getCateCoordinateOfBar = _ref2 => {
  const {
    axis,
    ticks,
    offset,
    bandSize,
    entry,
    index
  } = _ref2;
  if (axis.type === 'category') {
    return ticks[index] ? ticks[index].coordinate + offset : null;
  }
  const value = getValueByDataKey(entry, axis.dataKey, axis.scale.domain()[index]);
  return !(0, _DataUtils.isNullish)(value) ? axis.scale(value) - bandSize / 2 + offset : null;
};
exports.getCateCoordinateOfBar = getCateCoordinateOfBar;
const getBaseValueOfBar = _ref3 => {
  const {
    numericAxis
  } = _ref3;
  const domain = numericAxis.scale.domain();
  if (numericAxis.type === 'number') {
    // @ts-expect-error type number means the domain has numbers in it but this relationship is not known to typescript
    const minValue = Math.min(domain[0], domain[1]);
    // @ts-expect-error type number means the domain has numbers in it but this relationship is not known to typescript
    const maxValue = Math.max(domain[0], domain[1]);
    if (minValue <= 0 && maxValue >= 0) {
      return 0;
    }
    if (maxValue < 0) {
      return maxValue;
    }
    return minValue;
  }
  return domain[0];
};
exports.getBaseValueOfBar = getBaseValueOfBar;
const getDomainOfSingle = data => {
  const flat = data.flat(2).filter(_DataUtils.isNumber);
  return [Math.min(...flat), Math.max(...flat)];
};
const makeDomainFinite = domain => {
  return [domain[0] === Infinity ? 0 : domain[0], domain[1] === -Infinity ? 0 : domain[1]];
};
const getDomainOfStackGroups = (stackGroups, startIndex, endIndex) => {
  if (stackGroups == null) {
    return undefined;
  }
  return makeDomainFinite(Object.keys(stackGroups).reduce((result, stackId) => {
    const group = stackGroups[stackId];
    const {
      stackedData
    } = group;
    const domain = stackedData.reduce((res, entry) => {
      const sliced = (0, _getSliced.getSliced)(entry, startIndex, endIndex);
      const s = getDomainOfSingle(sliced);
      return [Math.min(res[0], s[0]), Math.max(res[1], s[1])];
    }, [Infinity, -Infinity]);
    return [Math.min(domain[0], result[0]), Math.max(domain[1], result[1])];
  }, [Infinity, -Infinity]));
};
exports.getDomainOfStackGroups = getDomainOfStackGroups;
const MIN_VALUE_REG = exports.MIN_VALUE_REG = /^dataMin[\s]*-[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/;
const MAX_VALUE_REG = exports.MAX_VALUE_REG = /^dataMax[\s]*\+[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/;

/**
 * Calculate the size between two category
 * @param  {Object} axis  The options of axis
 * @param  {Array}  ticks The ticks of axis
 * @param  {Boolean} isBar if items in axis are bars
 * @return {Number} Size
 */
const getBandSizeOfAxis = (axis, ticks, isBar) => {
  if (axis && axis.scale && axis.scale.bandwidth) {
    const bandWidth = axis.scale.bandwidth();
    if (!isBar || bandWidth > 0) {
      return bandWidth;
    }
  }
  if (axis && ticks && ticks.length >= 2) {
    const orderedTicks = (0, _sortBy.default)(ticks, o => o.coordinate);
    let bandSize = Infinity;
    for (let i = 1, len = orderedTicks.length; i < len; i++) {
      const cur = orderedTicks[i];
      const prev = orderedTicks[i - 1];
      bandSize = Math.min((cur.coordinate || 0) - (prev.coordinate || 0), bandSize);
    }
    return bandSize === Infinity ? 0 : bandSize;
  }
  return isBar ? undefined : 0;
};
exports.getBandSizeOfAxis = getBandSizeOfAxis;
function getTooltipEntry(_ref4) {
  const {
    tooltipEntrySettings,
    dataKey,
    payload,
    value,
    name
  } = _ref4;
  return _objectSpread(_objectSpread({}, tooltipEntrySettings), {}, {
    dataKey,
    payload,
    value,
    name
  });
}
function getTooltipNameProp(nameFromItem, dataKey) {
  if (nameFromItem) {
    return String(nameFromItem);
  }
  if (typeof dataKey === 'string') {
    return dataKey;
  }
  return undefined;
}
function inRange(x, y, layout, polarViewBox, offset) {
  if (layout === 'horizontal' || layout === 'vertical') {
    const isInRange = x >= offset.left && x <= offset.left + offset.width && y >= offset.top && y <= offset.top + offset.height;
    return isInRange ? {
      x,
      y
    } : null;
  }
  if (polarViewBox) {
    return (0, _PolarUtils.inRangeOfSector)({
      x,
      y
    }, polarViewBox);
  }
  return null;
}
const getActiveCoordinate = (layout, tooltipTicks, activeIndex, rangeObj) => {
  const entry = tooltipTicks.find(tick => tick && tick.index === activeIndex);
  if (entry) {
    if (layout === 'horizontal') {
      return {
        x: entry.coordinate,
        y: rangeObj.y
      };
    }
    if (layout === 'vertical') {
      return {
        x: rangeObj.x,
        y: entry.coordinate
      };
    }
    if (layout === 'centric') {
      const _angle = entry.coordinate;
      const {
        radius: _radius
      } = rangeObj;
      return _objectSpread(_objectSpread(_objectSpread({}, rangeObj), (0, _PolarUtils.polarToCartesian)(rangeObj.cx, rangeObj.cy, _radius, _angle)), {}, {
        angle: _angle,
        radius: _radius
      });
    }
    const radius = entry.coordinate;
    const {
      angle
    } = rangeObj;
    return _objectSpread(_objectSpread(_objectSpread({}, rangeObj), (0, _PolarUtils.polarToCartesian)(rangeObj.cx, rangeObj.cy, radius, angle)), {}, {
      angle,
      radius
    });
  }
  return {
    x: 0,
    y: 0
  };
};
exports.getActiveCoordinate = getActiveCoordinate;
const calculateTooltipPos = (rangeObj, layout) => {
  if (layout === 'horizontal') {
    return rangeObj.x;
  }
  if (layout === 'vertical') {
    return rangeObj.y;
  }
  if (layout === 'centric') {
    return rangeObj.angle;
  }
  return rangeObj.radius;
};
exports.calculateTooltipPos = calculateTooltipPos;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.combineRealScaleType = exports.combineNumericalDomain = exports.combineNiceTicks = exports.combineLinesDomain = exports.combineGraphicalItemsSettings = exports.combineGraphicalItemsData = exports.combineGraphicalItemTicks = exports.combineDuplicateDomain = exports.combineDotsDomain = exports.combineDomainOfStackGroups = exports.combineDisplayedData = exports.combineCategoricalDomain = exports.combineAxisTicks = exports.combineAxisDomainWithNiceTicks = exports.combineAxisDomain = exports.combineAreasDomain = exports.combineAppliedValues = exports.combineAppliedNumericalValuesIncludingErrorValues = void 0;
exports.combineScaleFunction = combineScaleFunction;
exports.filterReferenceElements = exports.filterGraphicalNotStackedItems = exports.combineYAxisRange = exports.combineXAxisRange = exports.combineStackGroups = void 0;
exports.fromMainValueToError = fromMainValueToError;
exports.getDomainDefinition = void 0;
exports.getErrorDomainByDataKey = getErrorDomainByDataKey;
exports.implicitZAxis = exports.implicitYAxis = exports.implicitXAxis = void 0;
exports.isErrorBarRelevantForAxisType = isErrorBarRelevantForAxisType;
exports.itemAxisPredicate = itemAxisPredicate;
exports.selectZAxisWithScale = exports.selectZAxisSettings = exports.selectYAxisSize = exports.selectYAxisSettingsNoDefaults = exports.selectYAxisSettings = exports.selectYAxisPosition = exports.selectXAxisSize = exports.selectXAxisSettingsNoDefaults = exports.selectXAxisSettings = exports.selectXAxisPosition = exports.selectUnfilteredCartesianItems = exports.selectTicksOfGraphicalItem = exports.selectTicksOfAxis = exports.selectStackedCartesianItemsSettings = exports.selectStackGroups = exports.selectSmallestDistanceBetweenValues = exports.selectReferenceLinesByAxis = exports.selectReferenceLines = exports.selectReferenceDotsByAxis = exports.selectReferenceDots = exports.selectReferenceAreasByAxis = exports.selectReferenceAreas = exports.selectRealScaleType = exports.selectNumericalDomain = exports.selectNiceTicks = exports.selectHasBar = exports.selectErrorBarsSettingsExceptStacked = exports.selectErrorBarsSettings = exports.selectDuplicateDomain = exports.selectDomainOfStackGroups = exports.selectDomainDefinition = exports.selectDisplayedStackedData = exports.selectDisplayedData = exports.selectChartDirection = exports.selectCategoricalDomain = exports.selectCartesianItemsSettings = exports.selectCartesianGraphicalItemsData = exports.selectCartesianAxisSize = exports.selectCalculatedYAxisPadding = exports.selectCalculatedXAxisPadding = exports.selectBaseAxis = exports.selectAxisWithScale = exports.selectAxisSettings = exports.selectAxisScale = exports.selectAxisRangeWithReverse = exports.selectAxisRange = exports.selectAxisPropsNeededForCartesianGridTicksGenerator = exports.selectAxisDomainIncludingNiceTicks = exports.selectAxisDomain = exports.selectAllYAxesOffsetSteps = exports.selectAllXAxesOffsetSteps = exports.selectAllErrorBarSettings = exports.selectAllAppliedValues = exports.selectAllAppliedNumericalValuesIncludingErrorValues = exports.mergeDomains = void 0;
const _reselect = require("reselect");
const _range = _interopRequireDefault(require("es-toolkit/compat/range"));
const d3Scales = _interopRequireWildcard(require("victory-vendor/d3-scale"));
const _chartLayoutContext = require("../../context/chartLayoutContext");
const _ChartUtils = require("../../util/ChartUtils");
const _dataSelectors = require("./dataSelectors");
const _isDomainSpecifiedByUser = require("../../util/isDomainSpecifiedByUser");
const _DataUtils = require("../../util/DataUtils");
const _isWellBehavedNumber = require("../../util/isWellBehavedNumber");
const _scale = require("../../util/scale");
const _containerSelectors = require("./containerSelectors");
const _selectAllAxes = require("./selectAllAxes");
const _selectChartOffsetInternal = require("./selectChartOffsetInternal");
const _brushSelectors = require("./brushSelectors");
const _rootPropsSelectors = require("./rootPropsSelectors");
const _polarAxisSelectors = require("./polarAxisSelectors");
const _pickAxisType = require("./pickAxisType");
const _pickAxisId = require("./pickAxisId");
const _combineAxisRangeWithReverse = require("./combiners/combineAxisRangeWithReverse");
const _Constants = require("../../util/Constants");
const _getStackSeriesIdentifier = require("../../util/stacks/getStackSeriesIdentifier");
const _selectTooltipAxis = require("./selectTooltipAxis");
const _combineDisplayedStackedData = require("./combiners/combineDisplayedStackedData");
const _StackedGraphicalItem = require("../types/StackedGraphicalItem");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; let o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const defaultNumericDomain = [0, 'auto'];

/**
 * angle, radius, X, Y, and Z axes all have domain and range and scale and associated settings
 */

/**
 * X and Y axes have ticks. Z axis is never displayed and so it lacks ticks
 * and tick settings.
 */

/**
 * If an axis is not explicitly defined as an element,
 * we still need to render something in the chart and we need
 * some object to hold the domain and default settings.
 */
const implicitXAxis = exports.implicitXAxis = {
  allowDataOverflow: false,
  allowDecimals: true,
  allowDuplicatedCategory: true,
  angle: 0,
  dataKey: undefined,
  domain: undefined,
  height: 30,
  hide: true,
  id: 0,
  includeHidden: false,
  interval: 'preserveEnd',
  minTickGap: 5,
  mirror: false,
  name: undefined,
  orientation: 'bottom',
  padding: {
    left: 0,
    right: 0
  },
  reversed: false,
  scale: 'auto',
  tick: true,
  tickCount: 5,
  tickFormatter: undefined,
  ticks: undefined,
  type: 'category',
  unit: undefined
};
const selectXAxisSettingsNoDefaults = (state, axisId) => {
  return state.cartesianAxis.xAxis[axisId];
};
exports.selectXAxisSettingsNoDefaults = selectXAxisSettingsNoDefaults;
const selectXAxisSettings = (state, axisId) => {
  const axis = selectXAxisSettingsNoDefaults(state, axisId);
  if (axis == null) {
    return implicitXAxis;
  }
  return axis;
};

/**
 * If an axis is not explicitly defined as an element,
 * we still need to render something in the chart and we need
 * some object to hold the domain and default settings.
 */
exports.selectXAxisSettings = selectXAxisSettings;
const implicitYAxis = exports.implicitYAxis = {
  allowDataOverflow: false,
  allowDecimals: true,
  allowDuplicatedCategory: true,
  angle: 0,
  dataKey: undefined,
  domain: defaultNumericDomain,
  hide: true,
  id: 0,
  includeHidden: false,
  interval: 'preserveEnd',
  minTickGap: 5,
  mirror: false,
  name: undefined,
  orientation: 'left',
  padding: {
    top: 0,
    bottom: 0
  },
  reversed: false,
  scale: 'auto',
  tick: true,
  tickCount: 5,
  tickFormatter: undefined,
  ticks: undefined,
  type: 'number',
  unit: undefined,
  width: _Constants.DEFAULT_Y_AXIS_WIDTH
};
const selectYAxisSettingsNoDefaults = (state, axisId) => {
  return state.cartesianAxis.yAxis[axisId];
};
exports.selectYAxisSettingsNoDefaults = selectYAxisSettingsNoDefaults;
const selectYAxisSettings = (state, axisId) => {
  const axis = selectYAxisSettingsNoDefaults(state, axisId);
  if (axis == null) {
    return implicitYAxis;
  }
  return axis;
};
exports.selectYAxisSettings = selectYAxisSettings;
const implicitZAxis = exports.implicitZAxis = {
  domain: [0, 'auto'],
  includeHidden: false,
  reversed: false,
  allowDataOverflow: false,
  allowDuplicatedCategory: false,
  dataKey: undefined,
  id: 0,
  name: '',
  range: [64, 64],
  scale: 'auto',
  type: 'number',
  unit: ''
};
const selectZAxisSettings = (state, axisId) => {
  const axis = state.cartesianAxis.zAxis[axisId];
  if (axis == null) {
    return implicitZAxis;
  }
  return axis;
};
exports.selectZAxisSettings = selectZAxisSettings;
const selectBaseAxis = (state, axisType, axisId) => {
  switch (axisType) {
    case 'xAxis':
      {
        return selectXAxisSettings(state, axisId);
      }
    case 'yAxis':
      {
        return selectYAxisSettings(state, axisId);
      }
    case 'zAxis':
      {
        return selectZAxisSettings(state, axisId);
      }
    case 'angleAxis':
      {
        return (0, _polarAxisSelectors.selectAngleAxis)(state, axisId);
      }
    case 'radiusAxis':
      {
        return (0, _polarAxisSelectors.selectRadiusAxis)(state, axisId);
      }
    default:
      throw new Error("Unexpected axis type: ".concat(axisType));
  }
};
exports.selectBaseAxis = selectBaseAxis;
const selectCartesianAxisSettings = (state, axisType, axisId) => {
  switch (axisType) {
    case 'xAxis':
      {
        return selectXAxisSettings(state, axisId);
      }
    case 'yAxis':
      {
        return selectYAxisSettings(state, axisId);
      }
    default:
      throw new Error("Unexpected axis type: ".concat(axisType));
  }
};

/**
 * Selects either an X or Y axis. Doesn't work with Z axis - for that, instead use selectBaseAxis.
 * @param state Root state
 * @param axisType xAxis | yAxis
 * @param axisId xAxisId | yAxisId
 * @returns axis settings object
 */
const selectAxisSettings = (state, axisType, axisId) => {
  switch (axisType) {
    case 'xAxis':
      {
        return selectXAxisSettings(state, axisId);
      }
    case 'yAxis':
      {
        return selectYAxisSettings(state, axisId);
      }
    case 'angleAxis':
      {
        return (0, _polarAxisSelectors.selectAngleAxis)(state, axisId);
      }
    case 'radiusAxis':
      {
        return (0, _polarAxisSelectors.selectRadiusAxis)(state, axisId);
      }
    default:
      throw new Error("Unexpected axis type: ".concat(axisType));
  }
};

/**
 * @param state RechartsRootState
 * @return boolean true if there is at least one Bar or RadialBar
 */
exports.selectAxisSettings = selectAxisSettings;
const selectHasBar = state => state.graphicalItems.cartesianItems.some(item => item.type === 'bar') || state.graphicalItems.polarItems.some(item => item.type === 'radialBar');

/**
 * Filters CartesianGraphicalItemSettings by the relevant axis ID
 * @param axisType 'xAxis' | 'yAxis' | 'zAxis' | 'radiusAxis' | 'angleAxis'
 * @param axisId from props, defaults to 0
 *
 * @returns Predicate function that return true for CartesianGraphicalItemSettings that are relevant to the specified axis
 */
exports.selectHasBar = selectHasBar;
function itemAxisPredicate(axisType, axisId) {
  return item => {
    switch (axisType) {
      case 'xAxis':
        // This is sensitive to the data type, as 0 !== '0'. I wonder if we should be more flexible. How does 2.x branch behave? TODO write test for that
        return 'xAxisId' in item && item.xAxisId === axisId;
      case 'yAxis':
        return 'yAxisId' in item && item.yAxisId === axisId;
      case 'zAxis':
        return 'zAxisId' in item && item.zAxisId === axisId;
      case 'angleAxis':
        return 'angleAxisId' in item && item.angleAxisId === axisId;
      case 'radiusAxis':
        return 'radiusAxisId' in item && item.radiusAxisId === axisId;
      default:
        return false;
    }
  };
}
const selectUnfilteredCartesianItems = state => state.graphicalItems.cartesianItems;
exports.selectUnfilteredCartesianItems = selectUnfilteredCartesianItems;
const selectAxisPredicate = (0, _reselect.createSelector)([_pickAxisType.pickAxisType, _pickAxisId.pickAxisId], itemAxisPredicate);
const combineGraphicalItemsSettings = (graphicalItems, axisSettings, axisPredicate) => graphicalItems.filter(axisPredicate).filter(item => {
  if ((axisSettings === null || axisSettings === void 0 ? void 0 : axisSettings.includeHidden) === true) {
    return true;
  }
  return !item.hide;
});
exports.combineGraphicalItemsSettings = combineGraphicalItemsSettings;
const selectCartesianItemsSettings = exports.selectCartesianItemsSettings = (0, _reselect.createSelector)([selectUnfilteredCartesianItems, selectBaseAxis, selectAxisPredicate], combineGraphicalItemsSettings);
const selectStackedCartesianItemsSettings = exports.selectStackedCartesianItemsSettings = (0, _reselect.createSelector)([selectCartesianItemsSettings], cartesianItems => {
  return cartesianItems.filter(item => item.type === 'area' || item.type === 'bar').filter(_StackedGraphicalItem.isStacked);
});
const filterGraphicalNotStackedItems = cartesianItems => cartesianItems.filter(item => !('stackId' in item) || item.stackId === undefined);
exports.filterGraphicalNotStackedItems = filterGraphicalNotStackedItems;
const selectCartesianItemsSettingsExceptStacked = (0, _reselect.createSelector)([selectCartesianItemsSettings], filterGraphicalNotStackedItems);
const combineGraphicalItemsData = cartesianItems => cartesianItems.map(item => item.data).filter(Boolean).flat(1);

/**
 * This is a "cheap" selector - it returns the data but doesn't iterate them, so it is not sensitive on the array length.
 * Also does not apply dataKey yet.
 * @param state RechartsRootState
 * @returns data defined on the chart graphical items, such as Line or Scatter or Pie, and filtered with appropriate dataKey
 */
exports.combineGraphicalItemsData = combineGraphicalItemsData;
const selectCartesianGraphicalItemsData = exports.selectCartesianGraphicalItemsData = (0, _reselect.createSelector)([selectCartesianItemsSettings], combineGraphicalItemsData);
const combineDisplayedData = (graphicalItemsData, _ref) => {
  const {
    chartData = [],
    dataStartIndex,
    dataEndIndex
  } = _ref;
  if (graphicalItemsData.length > 0) {
    /*
     * There is no slicing when data is defined on graphical items. Why?
     * Because Brush ignores data defined on graphical items,
     * and does not render.
     * So Brush will never show up in a Scatter chart for example.
     * This is something we will need to fix.
     *
     * Now, when the root chart data is not defined, the dataEndIndex is 0,
     * which means the itemsData will be sliced to an empty array anyway.
     * But that's an implementation detail, and we can fix that too.
     *
     * Also, in absence of Axis dataKey, we use the dataKey from each item, respectively.
     * This is the usual pattern for numerical axis, that is the one where bars go up:
     * users don't specify any dataKey by default and expect the axis to "just match the data".
     */
    return graphicalItemsData;
  }
  return chartData.slice(dataStartIndex, dataEndIndex + 1);
};

/**
 * This selector will return all data there is in the chart: graphical items, chart root, all together.
 * Useful for figuring out an axis domain (because that needs to know of everything),
 * not useful for rendering individual graphical elements (because they need to know which data is theirs and which is not).
 *
 * This function will discard the original indexes, so it is also not useful for anything that depends on ordering.
 */
exports.combineDisplayedData = combineDisplayedData;
const selectDisplayedData = exports.selectDisplayedData = (0, _reselect.createSelector)([selectCartesianGraphicalItemsData, _dataSelectors.selectChartDataWithIndexesIfNotInPanorama], combineDisplayedData);
const combineAppliedValues = (data, axisSettings, items) => {
  if ((axisSettings === null || axisSettings === void 0 ? void 0 : axisSettings.dataKey) != null) {
    return data.map(item => ({
      value: (0, _ChartUtils.getValueByDataKey)(item, axisSettings.dataKey)
    }));
  }
  if (items.length > 0) {
    return items.map(item => item.dataKey).flatMap(dataKey => data.map(entry => ({
      value: (0, _ChartUtils.getValueByDataKey)(entry, dataKey)
    })));
  }
  return data.map(entry => ({
    value: entry
  }));
};

/**
 * This selector will return all values with the appropriate dataKey applied on them.
 * Which dataKey is appropriate depends on where it is defined.
 *
 * This is an expensive selector - it will iterate all data and compute their value using the provided dataKey.
 */
exports.combineAppliedValues = combineAppliedValues;
const selectAllAppliedValues = exports.selectAllAppliedValues = (0, _reselect.createSelector)([selectDisplayedData, selectBaseAxis, selectCartesianItemsSettings], combineAppliedValues);
function isErrorBarRelevantForAxisType(axisType, errorBar) {
  switch (axisType) {
    case 'xAxis':
      return errorBar.direction === 'x';
    case 'yAxis':
      return errorBar.direction === 'y';
    default:
      return false;
  }
}

/**
 * This is type of "error" in chart. It is set by using ErrorBar, and it can represent confidence interval,
 * or gap in the data, or standard deviation, or quartiles in boxplot, or whiskers or whatever.
 *
 * We will internally represent it as a tuple of two numbers, where the first number is the lower bound and the second number is the upper bound.
 *
 * It is also true that the first number should be lower than or equal to the associated "main value",
 * and the second number should be higher than or equal to the associated "main value".
 */

function fromMainValueToError(value) {
  if ((0, _DataUtils.isNumber)(value) && Number.isFinite(value)) {
    return [value, value];
  }
  if (Array.isArray(value)) {
    const minError = Math.min(...value);
    const maxError = Math.max(...value);
    if (!(0, _DataUtils.isNan)(minError) && !(0, _DataUtils.isNan)(maxError) && Number.isFinite(minError) && Number.isFinite(maxError)) {
      return [minError, maxError];
    }
  }
  return undefined;
}
function onlyAllowNumbers(data) {
  return data.filter(v => (0, _DataUtils.isNumOrStr)(v) || v instanceof Date).map(Number).filter(n => (0, _DataUtils.isNan)(n) === false);
}

/**
 * @param entry One item in the 'data' array. Could be anything really - this is defined externally. This is the raw, before dataKey application
 * @param appliedValue This is the result of applying the 'main' dataKey on the `entry`.
 * @param relevantErrorBars Error bars that are relevant for the current axis and layout and all that.
 * @return either undefined or an array of ErrorValue
 */
function getErrorDomainByDataKey(entry, appliedValue, relevantErrorBars) {
  if (!relevantErrorBars || typeof appliedValue !== 'number' || (0, _DataUtils.isNan)(appliedValue)) {
    return [];
  }
  if (!relevantErrorBars.length) {
    return [];
  }
  return onlyAllowNumbers(relevantErrorBars.flatMap(eb => {
    const errorValue = (0, _ChartUtils.getValueByDataKey)(entry, eb.dataKey);
    let lowBound, highBound;
    if (Array.isArray(errorValue)) {
      [lowBound, highBound] = errorValue;
    } else {
      lowBound = highBound = errorValue;
    }
    if (!(0, _isWellBehavedNumber.isWellBehavedNumber)(lowBound) || !(0, _isWellBehavedNumber.isWellBehavedNumber)(highBound)) {
      return undefined;
    }
    return [appliedValue - lowBound, appliedValue + highBound];
  }));
}
const selectDisplayedStackedData = exports.selectDisplayedStackedData = (0, _reselect.createSelector)([selectStackedCartesianItemsSettings, _dataSelectors.selectChartDataWithIndexesIfNotInPanorama, _selectTooltipAxis.selectTooltipAxis], _combineDisplayedStackedData.combineDisplayedStackedData);
const combineStackGroups = (displayedData, items, stackOffsetType) => {
  const initialItemsGroups = {};
  const itemsGroup = items.reduce((acc, item) => {
    if (item.stackId == null) {
      return acc;
    }
    if (acc[item.stackId] == null) {
      acc[item.stackId] = [];
    }
    acc[item.stackId].push(item);
    return acc;
  }, initialItemsGroups);
  return Object.fromEntries(Object.entries(itemsGroup).map(_ref2 => {
    const [stackId, graphicalItems] = _ref2;
    const dataKeys = graphicalItems.map(_getStackSeriesIdentifier.getStackSeriesIdentifier);
    return [stackId, {
      // @ts-expect-error getStackedData requires that the input is array of objects, Recharts does not test for that
      stackedData: (0, _ChartUtils.getStackedData)(displayedData, dataKeys, stackOffsetType),
      graphicalItems
    }];
  }));
};

/**
 * Stack groups are groups of graphical items that stack on each other.
 * Stack is a function of axis type (X, Y), axis ID, and stack ID.
 * Graphical items that do not have a stack ID are not going to be present in stack groups.
 */
exports.combineStackGroups = combineStackGroups;
const selectStackGroups = exports.selectStackGroups = (0, _reselect.createSelector)([selectDisplayedStackedData, selectStackedCartesianItemsSettings, _rootPropsSelectors.selectStackOffsetType], combineStackGroups);
const combineDomainOfStackGroups = (stackGroups, _ref3, axisType) => {
  const {
    dataStartIndex,
    dataEndIndex
  } = _ref3;
  if (axisType === 'zAxis') {
    // ZAxis ignores stacks
    return undefined;
  }
  const domainOfStackGroups = (0, _ChartUtils.getDomainOfStackGroups)(stackGroups, dataStartIndex, dataEndIndex);
  if (domainOfStackGroups != null && domainOfStackGroups[0] === 0 && domainOfStackGroups[1] === 0) {
    return undefined;
  }
  return domainOfStackGroups;
};
exports.combineDomainOfStackGroups = combineDomainOfStackGroups;
const selectDomainOfStackGroups = exports.selectDomainOfStackGroups = (0, _reselect.createSelector)([selectStackGroups, _dataSelectors.selectChartDataWithIndexes, _pickAxisType.pickAxisType], combineDomainOfStackGroups);
const combineAppliedNumericalValuesIncludingErrorValues = (data, axisSettings, items, errorBars, axisType) => {
  if (items.length > 0) {
    return data.flatMap(entry => {
      return items.flatMap(item => {
        let _errorBars$item$id, _axisSettings$dataKey;
        const relevantErrorBars = (_errorBars$item$id = errorBars[item.id]) === null || _errorBars$item$id === void 0 ? void 0 : _errorBars$item$id.filter(errorBar => isErrorBarRelevantForAxisType(axisType, errorBar));
        const valueByDataKey = (0, _ChartUtils.getValueByDataKey)(entry, (_axisSettings$dataKey = axisSettings.dataKey) !== null && _axisSettings$dataKey !== void 0 ? _axisSettings$dataKey : item.dataKey);
        return {
          value: valueByDataKey,
          errorDomain: getErrorDomainByDataKey(entry, valueByDataKey, relevantErrorBars)
        };
      });
    }).filter(Boolean);
  }
  if ((axisSettings === null || axisSettings === void 0 ? void 0 : axisSettings.dataKey) != null) {
    return data.map(item => ({
      value: (0, _ChartUtils.getValueByDataKey)(item, axisSettings.dataKey),
      errorDomain: []
    }));
  }
  return data.map(entry => ({
    value: entry,
    errorDomain: []
  }));
};
exports.combineAppliedNumericalValuesIncludingErrorValues = combineAppliedNumericalValuesIncludingErrorValues;
const selectAllErrorBarSettings = state => state.errorBars;
exports.selectAllErrorBarSettings = selectAllErrorBarSettings;
const combineRelevantErrorBarSettings = (cartesianItemsSettings, allErrorBarSettings, axisType) => {
  return cartesianItemsSettings.flatMap(item => {
    return allErrorBarSettings[item.id];
  }).filter(Boolean).filter(e => {
    return isErrorBarRelevantForAxisType(axisType, e);
  });
};
const selectErrorBarsSettingsExceptStacked = exports.selectErrorBarsSettingsExceptStacked = (0, _reselect.createSelector)([selectCartesianItemsSettingsExceptStacked, selectAllErrorBarSettings, _pickAxisType.pickAxisType], combineRelevantErrorBarSettings);
const selectAllAppliedNumericalValuesIncludingErrorValues = exports.selectAllAppliedNumericalValuesIncludingErrorValues = (0, _reselect.createSelector)([selectDisplayedData, selectBaseAxis, selectCartesianItemsSettingsExceptStacked, selectAllErrorBarSettings, _pickAxisType.pickAxisType], combineAppliedNumericalValuesIncludingErrorValues);
function onlyAllowNumbersAndStringsAndDates(item) {
  const {
    value
  } = item;
  if ((0, _DataUtils.isNumOrStr)(value) || value instanceof Date) {
    return value;
  }
  return undefined;
}
const computeNumericalDomain = dataWithErrorDomains => {
  const allDataSquished = dataWithErrorDomains
  // This flatMap has to be flat because we're creating a new array in the return value
  .flatMap(d => [d.value, d.errorDomain])
  // This flat is needed because a) errorDomain is an array, and b) value may be a number, or it may be a range (for Area, for example)
  .flat(1);
  const onlyNumbers = onlyAllowNumbers(allDataSquished);
  if (onlyNumbers.length === 0) {
    return undefined;
  }
  return [Math.min(...onlyNumbers), Math.max(...onlyNumbers)];
};
const computeDomainOfTypeCategory = (allDataSquished, axisSettings, isCategorical) => {
  const categoricalDomain = allDataSquished.map(onlyAllowNumbersAndStringsAndDates).filter(v => v != null);
  if (isCategorical && (axisSettings.dataKey == null || axisSettings.allowDuplicatedCategory && (0, _DataUtils.hasDuplicate)(categoricalDomain))) {
    /*
     * 1. In an absence of dataKey, Recharts will use array indexes as its categorical domain
     * 2. When category axis has duplicated text, serial numbers are used to generate scale
     */
    return (0, _range.default)(0, allDataSquished.length);
  }
  if (axisSettings.allowDuplicatedCategory) {
    return categoricalDomain;
  }
  return Array.from(new Set(categoricalDomain));
};
const getDomainDefinition = axisSettings => {
  let _axisSettings$domain;
  if (axisSettings == null || !('domain' in axisSettings)) {
    return defaultNumericDomain;
  }
  if (axisSettings.domain != null) {
    return axisSettings.domain;
  }
  if (axisSettings.ticks != null) {
    if (axisSettings.type === 'number') {
      const allValues = onlyAllowNumbers(axisSettings.ticks);
      return [Math.min(...allValues), Math.max(...allValues)];
    }
    if (axisSettings.type === 'category') {
      return axisSettings.ticks.map(String);
    }
  }
  return (_axisSettings$domain = axisSettings === null || axisSettings === void 0 ? void 0 : axisSettings.domain) !== null && _axisSettings$domain !== void 0 ? _axisSettings$domain : defaultNumericDomain;
};
exports.getDomainDefinition = getDomainDefinition;
const mergeDomains = exports.mergeDomains = function mergeDomains() {
  for (var _len = arguments.length, domains = new Array(_len), _key = 0; _key < _len; _key++) {
    domains[_key] = arguments[_key];
  }
  const allDomains = domains.filter(Boolean);
  if (allDomains.length === 0) {
    return undefined;
  }
  const allValues = allDomains.flat();
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  return [min, max];
};
const selectReferenceDots = state => state.referenceElements.dots;
exports.selectReferenceDots = selectReferenceDots;
const filterReferenceElements = (elements, axisType, axisId) => {
  return elements.filter(el => el.ifOverflow === 'extendDomain').filter(el => {
    if (axisType === 'xAxis') {
      return el.xAxisId === axisId;
    }
    return el.yAxisId === axisId;
  });
};
exports.filterReferenceElements = filterReferenceElements;
const selectReferenceDotsByAxis = exports.selectReferenceDotsByAxis = (0, _reselect.createSelector)([selectReferenceDots, _pickAxisType.pickAxisType, _pickAxisId.pickAxisId], filterReferenceElements);
const selectReferenceAreas = state => state.referenceElements.areas;
exports.selectReferenceAreas = selectReferenceAreas;
const selectReferenceAreasByAxis = exports.selectReferenceAreasByAxis = (0, _reselect.createSelector)([selectReferenceAreas, _pickAxisType.pickAxisType, _pickAxisId.pickAxisId], filterReferenceElements);
const selectReferenceLines = state => state.referenceElements.lines;
exports.selectReferenceLines = selectReferenceLines;
const selectReferenceLinesByAxis = exports.selectReferenceLinesByAxis = (0, _reselect.createSelector)([selectReferenceLines, _pickAxisType.pickAxisType, _pickAxisId.pickAxisId], filterReferenceElements);
const combineDotsDomain = (dots, axisType) => {
  const allCoords = onlyAllowNumbers(dots.map(dot => axisType === 'xAxis' ? dot.x : dot.y));
  if (allCoords.length === 0) {
    return undefined;
  }
  return [Math.min(...allCoords), Math.max(...allCoords)];
};
exports.combineDotsDomain = combineDotsDomain;
const selectReferenceDotsDomain = (0, _reselect.createSelector)(selectReferenceDotsByAxis, _pickAxisType.pickAxisType, combineDotsDomain);
const combineAreasDomain = (areas, axisType) => {
  const allCoords = onlyAllowNumbers(areas.flatMap(area => [axisType === 'xAxis' ? area.x1 : area.y1, axisType === 'xAxis' ? area.x2 : area.y2]));
  if (allCoords.length === 0) {
    return undefined;
  }
  return [Math.min(...allCoords), Math.max(...allCoords)];
};
exports.combineAreasDomain = combineAreasDomain;
const selectReferenceAreasDomain = (0, _reselect.createSelector)([selectReferenceAreasByAxis, _pickAxisType.pickAxisType], combineAreasDomain);
const combineLinesDomain = (lines, axisType) => {
  const allCoords = onlyAllowNumbers(lines.map(line => axisType === 'xAxis' ? line.x : line.y));
  if (allCoords.length === 0) {
    return undefined;
  }
  return [Math.min(...allCoords), Math.max(...allCoords)];
};
exports.combineLinesDomain = combineLinesDomain;
const selectReferenceLinesDomain = (0, _reselect.createSelector)(selectReferenceLinesByAxis, _pickAxisType.pickAxisType, combineLinesDomain);
const selectReferenceElementsDomain = (0, _reselect.createSelector)(selectReferenceDotsDomain, selectReferenceLinesDomain, selectReferenceAreasDomain, (dotsDomain, linesDomain, areasDomain) => {
  return mergeDomains(dotsDomain, areasDomain, linesDomain);
});
const selectDomainDefinition = exports.selectDomainDefinition = (0, _reselect.createSelector)([selectBaseAxis], getDomainDefinition);
const combineNumericalDomain = (axisSettings, domainDefinition, domainOfStackGroups, allDataWithErrorDomains, referenceElementsDomain, layout, axisType) => {
  const domainFromUserPreference = (0, _isDomainSpecifiedByUser.numericalDomainSpecifiedWithoutRequiringData)(domainDefinition, axisSettings.allowDataOverflow);
  if (domainFromUserPreference != null) {
    // We're done! No need to compute anything else.
    return domainFromUserPreference;
  }
  const shouldIncludeDomainOfStackGroups = layout === 'vertical' && axisType === 'xAxis' || layout === 'horizontal' && axisType === 'yAxis';
  const mergedDomains = shouldIncludeDomainOfStackGroups ? mergeDomains(domainOfStackGroups, referenceElementsDomain, computeNumericalDomain(allDataWithErrorDomains)) : mergeDomains(referenceElementsDomain, computeNumericalDomain(allDataWithErrorDomains));
  return (0, _isDomainSpecifiedByUser.parseNumericalUserDomain)(domainDefinition, mergedDomains, axisSettings.allowDataOverflow);
};
exports.combineNumericalDomain = combineNumericalDomain;
const selectNumericalDomain = exports.selectNumericalDomain = (0, _reselect.createSelector)([selectBaseAxis, selectDomainDefinition, selectDomainOfStackGroups, selectAllAppliedNumericalValuesIncludingErrorValues, selectReferenceElementsDomain, _chartLayoutContext.selectChartLayout, _pickAxisType.pickAxisType], combineNumericalDomain);

/**
 * Expand by design maps everything between 0 and 1,
 * there is nothing to compute.
 * See https://d3js.org/d3-shape/stack#stack-offsets
 */
const expandDomain = [0, 1];
const combineAxisDomain = (axisSettings, layout, displayedData, allAppliedValues, stackOffsetType, axisType, numericalDomain) => {
  if ((axisSettings == null || displayedData == null || displayedData.length === 0) && numericalDomain === undefined) {
    return undefined;
  }
  const {
    dataKey,
    type
  } = axisSettings;
  const isCategorical = (0, _ChartUtils.isCategoricalAxis)(layout, axisType);
  if (isCategorical && dataKey == null) {
    return (0, _range.default)(0, displayedData.length);
  }
  if (type === 'category') {
    return computeDomainOfTypeCategory(allAppliedValues, axisSettings, isCategorical);
  }
  if (stackOffsetType === 'expand') {
    return expandDomain;
  }
  return numericalDomain;
};
exports.combineAxisDomain = combineAxisDomain;
const selectAxisDomain = exports.selectAxisDomain = (0, _reselect.createSelector)([selectBaseAxis, _chartLayoutContext.selectChartLayout, selectDisplayedData, selectAllAppliedValues, _rootPropsSelectors.selectStackOffsetType, _pickAxisType.pickAxisType, selectNumericalDomain], combineAxisDomain);
const combineRealScaleType = (axisConfig, layout, hasBar, chartType, axisType) => {
  if (axisConfig == null) {
    return undefined;
  }
  const {
    scale,
    type
  } = axisConfig;
  if (scale === 'auto') {
    if (layout === 'radial' && axisType === 'radiusAxis') {
      return 'band';
    }
    if (layout === 'radial' && axisType === 'angleAxis') {
      return 'linear';
    }
    if (type === 'category' && chartType && (chartType.indexOf('LineChart') >= 0 || chartType.indexOf('AreaChart') >= 0 || chartType.indexOf('ComposedChart') >= 0 && !hasBar)) {
      return 'point';
    }
    if (type === 'category') {
      return 'band';
    }
    return 'linear';
  }
  if (typeof scale === 'string') {
    const name = "scale".concat((0, _DataUtils.upperFirst)(scale));
    return name in d3Scales ? name : 'point';
  }
  return undefined;
};
exports.combineRealScaleType = combineRealScaleType;
const selectRealScaleType = exports.selectRealScaleType = (0, _reselect.createSelector)([selectBaseAxis, _chartLayoutContext.selectChartLayout, selectHasBar, _rootPropsSelectors.selectChartName, _pickAxisType.pickAxisType], combineRealScaleType);
function getD3ScaleFromType(realScaleType) {
  if (realScaleType == null) {
    return undefined;
  }
  if (realScaleType in d3Scales) {
    // @ts-expect-error we should do better type verification here
    return d3Scales[realScaleType]();
  }
  const name = "scale".concat((0, _DataUtils.upperFirst)(realScaleType));
  if (name in d3Scales) {
    // @ts-expect-error we should do better type verification here
    return d3Scales[name]();
  }
  return undefined;
}
function combineScaleFunction(axis, realScaleType, axisDomain, axisRange) {
  if (axisDomain == null || axisRange == null) {
    return undefined;
  }
  if (typeof axis.scale === 'function') {
    // @ts-expect-error we're going to assume here that if axis.scale is a function then it is a d3Scale function
    return axis.scale.copy().domain(axisDomain).range(axisRange);
  }
  const d3ScaleFunction = getD3ScaleFromType(realScaleType);
  if (d3ScaleFunction == null) {
    return undefined;
  }
  const scale = d3ScaleFunction.domain(axisDomain).range(axisRange);
  // I don't like this function because it mutates the scale. We should come up with a way to compute the domain up front.
  (0, _ChartUtils.checkDomainOfScale)(scale);
  return scale;
}
const combineNiceTicks = (axisDomain, axisSettings, realScaleType) => {
  const domainDefinition = getDomainDefinition(axisSettings);
  if (realScaleType !== 'auto' && realScaleType !== 'linear') {
    return undefined;
  }
  if (axisSettings != null && axisSettings.tickCount && Array.isArray(domainDefinition) && (domainDefinition[0] === 'auto' || domainDefinition[1] === 'auto') && (0, _isDomainSpecifiedByUser.isWellFormedNumberDomain)(axisDomain)) {
    return (0, _scale.getNiceTickValues)(axisDomain, axisSettings.tickCount, axisSettings.allowDecimals);
  }
  if (axisSettings != null && axisSettings.tickCount && axisSettings.type === 'number' && (0, _isDomainSpecifiedByUser.isWellFormedNumberDomain)(axisDomain)) {
    return (0, _scale.getTickValuesFixedDomain)(axisDomain, axisSettings.tickCount, axisSettings.allowDecimals);
  }
  return undefined;
};
exports.combineNiceTicks = combineNiceTicks;
const selectNiceTicks = exports.selectNiceTicks = (0, _reselect.createSelector)([selectAxisDomain, selectAxisSettings, selectRealScaleType], combineNiceTicks);
const combineAxisDomainWithNiceTicks = (axisSettings, domain, niceTicks, axisType) => {
  if (
  /*
   * Angle axis for some reason uses nice ticks when rendering axis tick labels,
   * but doesn't use nice ticks for extending domain like all the other axes do.
   * Not really sure why? Is there a good reason,
   * or is it just because someone added support for nice ticks to the other axes and forgot this one?
   */
  axisType !== 'angleAxis' && (axisSettings === null || axisSettings === void 0 ? void 0 : axisSettings.type) === 'number' && (0, _isDomainSpecifiedByUser.isWellFormedNumberDomain)(domain) && Array.isArray(niceTicks) && niceTicks.length > 0) {
    const minFromDomain = domain[0];
    const minFromTicks = niceTicks[0];
    const maxFromDomain = domain[1];
    const maxFromTicks = niceTicks[niceTicks.length - 1];
    return [Math.min(minFromDomain, minFromTicks), Math.max(maxFromDomain, maxFromTicks)];
  }
  return domain;
};
exports.combineAxisDomainWithNiceTicks = combineAxisDomainWithNiceTicks;
const selectAxisDomainIncludingNiceTicks = exports.selectAxisDomainIncludingNiceTicks = (0, _reselect.createSelector)([selectBaseAxis, selectAxisDomain, selectNiceTicks, _pickAxisType.pickAxisType], combineAxisDomainWithNiceTicks);

/**
 * Returns the smallest gap, between two numbers in the data, as a ratio of the whole range (max - min).
 * Ignores domain provided by user and only considers domain from data.
 *
 * The result is a number between 0 and 1.
 */
const selectSmallestDistanceBetweenValues = exports.selectSmallestDistanceBetweenValues = (0, _reselect.createSelector)(selectAllAppliedValues, selectBaseAxis, (allDataSquished, axisSettings) => {
  if (!axisSettings || axisSettings.type !== 'number') {
    return undefined;
  }
  let smallestDistanceBetweenValues = Infinity;
  const sortedValues = Array.from(onlyAllowNumbers(allDataSquished.map(d => d.value))).sort((a, b) => a - b);
  if (sortedValues.length < 2) {
    return Infinity;
  }
  const diff = sortedValues[sortedValues.length - 1] - sortedValues[0];
  if (diff === 0) {
    return Infinity;
  }
  // Only do n - 1 distance calculations because there's only n - 1 distances between n values.
  for (let i = 0; i < sortedValues.length - 1; i++) {
    const distance = sortedValues[i + 1] - sortedValues[i];
    smallestDistanceBetweenValues = Math.min(smallestDistanceBetweenValues, distance);
  }
  return smallestDistanceBetweenValues / diff;
});
const selectCalculatedPadding = (0, _reselect.createSelector)(selectSmallestDistanceBetweenValues, _chartLayoutContext.selectChartLayout, _rootPropsSelectors.selectBarCategoryGap, _selectChartOffsetInternal.selectChartOffsetInternal, (_1, _2, _3, padding) => padding, (smallestDistanceInPercent, layout, barCategoryGap, offset, padding) => {
  if (!(0, _isWellBehavedNumber.isWellBehavedNumber)(smallestDistanceInPercent)) {
    return 0;
  }
  const rangeWidth = layout === 'vertical' ? offset.height : offset.width;
  if (padding === 'gap') {
    return smallestDistanceInPercent * rangeWidth / 2;
  }
  if (padding === 'no-gap') {
    const gap = (0, _DataUtils.getPercentValue)(barCategoryGap, smallestDistanceInPercent * rangeWidth);
    const halfBand = smallestDistanceInPercent * rangeWidth / 2;
    return halfBand - gap - (halfBand - gap) / rangeWidth * gap;
  }
  return 0;
});
const selectCalculatedXAxisPadding = (state, axisId) => {
  const xAxisSettings = selectXAxisSettings(state, axisId);
  if (xAxisSettings == null || typeof xAxisSettings.padding !== 'string') {
    return 0;
  }
  return selectCalculatedPadding(state, 'xAxis', axisId, xAxisSettings.padding);
};
exports.selectCalculatedXAxisPadding = selectCalculatedXAxisPadding;
const selectCalculatedYAxisPadding = (state, axisId) => {
  const yAxisSettings = selectYAxisSettings(state, axisId);
  if (yAxisSettings == null || typeof yAxisSettings.padding !== 'string') {
    return 0;
  }
  return selectCalculatedPadding(state, 'yAxis', axisId, yAxisSettings.padding);
};
exports.selectCalculatedYAxisPadding = selectCalculatedYAxisPadding;
const selectXAxisPadding = (0, _reselect.createSelector)(selectXAxisSettings, selectCalculatedXAxisPadding, (xAxisSettings, calculated) => {
  let _padding$left, _padding$right;
  if (xAxisSettings == null) {
    return {
      left: 0,
      right: 0
    };
  }
  const {
    padding
  } = xAxisSettings;
  if (typeof padding === 'string') {
    return {
      left: calculated,
      right: calculated
    };
  }
  return {
    left: ((_padding$left = padding.left) !== null && _padding$left !== void 0 ? _padding$left : 0) + calculated,
    right: ((_padding$right = padding.right) !== null && _padding$right !== void 0 ? _padding$right : 0) + calculated
  };
});
const selectYAxisPadding = (0, _reselect.createSelector)(selectYAxisSettings, selectCalculatedYAxisPadding, (yAxisSettings, calculated) => {
  let _padding$top, _padding$bottom;
  if (yAxisSettings == null) {
    return {
      top: 0,
      bottom: 0
    };
  }
  const {
    padding
  } = yAxisSettings;
  if (typeof padding === 'string') {
    return {
      top: calculated,
      bottom: calculated
    };
  }
  return {
    top: ((_padding$top = padding.top) !== null && _padding$top !== void 0 ? _padding$top : 0) + calculated,
    bottom: ((_padding$bottom = padding.bottom) !== null && _padding$bottom !== void 0 ? _padding$bottom : 0) + calculated
  };
});
const combineXAxisRange = exports.combineXAxisRange = (0, _reselect.createSelector)([_selectChartOffsetInternal.selectChartOffsetInternal, selectXAxisPadding, _brushSelectors.selectBrushDimensions, _brushSelectors.selectBrushSettings, (_state, _axisId, isPanorama) => isPanorama], (offset, padding, brushDimensions, _ref4, isPanorama) => {
  const {
    padding: brushPadding
  } = _ref4;
  if (isPanorama) {
    return [brushPadding.left, brushDimensions.width - brushPadding.right];
  }
  return [offset.left + padding.left, offset.left + offset.width - padding.right];
});
const combineYAxisRange = exports.combineYAxisRange = (0, _reselect.createSelector)([_selectChartOffsetInternal.selectChartOffsetInternal, _chartLayoutContext.selectChartLayout, selectYAxisPadding, _brushSelectors.selectBrushDimensions, _brushSelectors.selectBrushSettings, (_state, _axisId, isPanorama) => isPanorama], (offset, layout, padding, brushDimensions, _ref5, isPanorama) => {
  const {
    padding: brushPadding
  } = _ref5;
  if (isPanorama) {
    return [brushDimensions.height - brushPadding.bottom, brushPadding.top];
  }
  if (layout === 'horizontal') {
    return [offset.top + offset.height - padding.bottom, offset.top + padding.top];
  }
  return [offset.top + padding.top, offset.top + offset.height - padding.bottom];
});
const selectAxisRange = (state, axisType, axisId, isPanorama) => {
  let _selectZAxisSettings;
  switch (axisType) {
    case 'xAxis':
      return combineXAxisRange(state, axisId, isPanorama);
    case 'yAxis':
      return combineYAxisRange(state, axisId, isPanorama);
    case 'zAxis':
      return (_selectZAxisSettings = selectZAxisSettings(state, axisId)) === null || _selectZAxisSettings === void 0 ? void 0 : _selectZAxisSettings.range;
    case 'angleAxis':
      return (0, _polarAxisSelectors.selectAngleAxisRange)(state);
    case 'radiusAxis':
      return (0, _polarAxisSelectors.selectRadiusAxisRange)(state, axisId);
    default:
      return undefined;
  }
};
exports.selectAxisRange = selectAxisRange;
const selectAxisRangeWithReverse = exports.selectAxisRangeWithReverse = (0, _reselect.createSelector)([selectBaseAxis, selectAxisRange], _combineAxisRangeWithReverse.combineAxisRangeWithReverse);
const selectAxisScale = exports.selectAxisScale = (0, _reselect.createSelector)([selectBaseAxis, selectRealScaleType, selectAxisDomainIncludingNiceTicks, selectAxisRangeWithReverse], combineScaleFunction);
const selectErrorBarsSettings = exports.selectErrorBarsSettings = (0, _reselect.createSelector)([selectCartesianItemsSettings, selectAllErrorBarSettings, _pickAxisType.pickAxisType], combineRelevantErrorBarSettings);
function compareIds(a, b) {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
}
const pickAxisOrientation = (_state, orientation) => orientation;
const pickMirror = (_state, _orientation, mirror) => mirror;
const selectAllXAxesWithOffsetType = (0, _reselect.createSelector)(_selectAllAxes.selectAllXAxes, pickAxisOrientation, pickMirror, (allAxes, orientation, mirror) => allAxes.filter(axis => axis.orientation === orientation).filter(axis => axis.mirror === mirror).sort(compareIds));
const selectAllYAxesWithOffsetType = (0, _reselect.createSelector)(_selectAllAxes.selectAllYAxes, pickAxisOrientation, pickMirror, (allAxes, orientation, mirror) => allAxes.filter(axis => axis.orientation === orientation).filter(axis => axis.mirror === mirror).sort(compareIds));
const getXAxisSize = (offset, axisSettings) => {
  return {
    width: offset.width,
    height: axisSettings.height
  };
};
const getYAxisSize = (offset, axisSettings) => {
  const width = typeof axisSettings.width === 'number' ? axisSettings.width : _Constants.DEFAULT_Y_AXIS_WIDTH;
  return {
    width,
    height: offset.height
  };
};
const selectXAxisSize = exports.selectXAxisSize = (0, _reselect.createSelector)(_selectChartOffsetInternal.selectChartOffsetInternal, selectXAxisSettings, getXAxisSize);
const combineXAxisPositionStartingPoint = (offset, orientation, chartHeight) => {
  switch (orientation) {
    case 'top':
      return offset.top;
    case 'bottom':
      return chartHeight - offset.bottom;
    default:
      return 0;
  }
};
const combineYAxisPositionStartingPoint = (offset, orientation, chartWidth) => {
  switch (orientation) {
    case 'left':
      return offset.left;
    case 'right':
      return chartWidth - offset.right;
    default:
      return 0;
  }
};
const selectAllXAxesOffsetSteps = exports.selectAllXAxesOffsetSteps = (0, _reselect.createSelector)(_containerSelectors.selectChartHeight, _selectChartOffsetInternal.selectChartOffsetInternal, selectAllXAxesWithOffsetType, pickAxisOrientation, pickMirror, (chartHeight, offset, allAxesWithSameOffsetType, orientation, mirror) => {
  const steps = {};
  let position;
  allAxesWithSameOffsetType.forEach(axis => {
    const axisSize = getXAxisSize(offset, axis);
    if (position == null) {
      position = combineXAxisPositionStartingPoint(offset, orientation, chartHeight);
    }
    const needSpace = orientation === 'top' && !mirror || orientation === 'bottom' && mirror;
    steps[axis.id] = position - Number(needSpace) * axisSize.height;
    position += (needSpace ? -1 : 1) * axisSize.height;
  });
  return steps;
});
const selectAllYAxesOffsetSteps = exports.selectAllYAxesOffsetSteps = (0, _reselect.createSelector)(_containerSelectors.selectChartWidth, _selectChartOffsetInternal.selectChartOffsetInternal, selectAllYAxesWithOffsetType, pickAxisOrientation, pickMirror, (chartWidth, offset, allAxesWithSameOffsetType, orientation, mirror) => {
  const steps = {};
  let position;
  allAxesWithSameOffsetType.forEach(axis => {
    const axisSize = getYAxisSize(offset, axis);
    if (position == null) {
      position = combineYAxisPositionStartingPoint(offset, orientation, chartWidth);
    }
    const needSpace = orientation === 'left' && !mirror || orientation === 'right' && mirror;
    steps[axis.id] = position - Number(needSpace) * axisSize.width;
    position += (needSpace ? -1 : 1) * axisSize.width;
  });
  return steps;
});
const selectXAxisOffsetSteps = (state, axisId) => {
  const axisSettings = selectXAxisSettings(state, axisId);
  if (axisSettings == null) {
    return undefined;
  }
  return selectAllXAxesOffsetSteps(state, axisSettings.orientation, axisSettings.mirror);
};
const selectXAxisPosition = exports.selectXAxisPosition = (0, _reselect.createSelector)([_selectChartOffsetInternal.selectChartOffsetInternal, selectXAxisSettings, selectXAxisOffsetSteps, (_, axisId) => axisId], (offset, axisSettings, allSteps, axisId) => {
  if (axisSettings == null) {
    return undefined;
  }
  const stepOfThisAxis = allSteps === null || allSteps === void 0 ? void 0 : allSteps[axisId];
  if (stepOfThisAxis == null) {
    return {
      x: offset.left,
      y: 0
    };
  }
  return {
    x: offset.left,
    y: stepOfThisAxis
  };
});
const selectYAxisOffsetSteps = (state, axisId) => {
  const axisSettings = selectYAxisSettings(state, axisId);
  if (axisSettings == null) {
    return undefined;
  }
  return selectAllYAxesOffsetSteps(state, axisSettings.orientation, axisSettings.mirror);
};
const selectYAxisPosition = exports.selectYAxisPosition = (0, _reselect.createSelector)([_selectChartOffsetInternal.selectChartOffsetInternal, selectYAxisSettings, selectYAxisOffsetSteps, (_, axisId) => axisId], (offset, axisSettings, allSteps, axisId) => {
  if (axisSettings == null) {
    return undefined;
  }
  const stepOfThisAxis = allSteps === null || allSteps === void 0 ? void 0 : allSteps[axisId];
  if (stepOfThisAxis == null) {
    return {
      x: 0,
      y: offset.top
    };
  }
  return {
    x: stepOfThisAxis,
    y: offset.top
  };
});
const selectYAxisSize = exports.selectYAxisSize = (0, _reselect.createSelector)(_selectChartOffsetInternal.selectChartOffsetInternal, selectYAxisSettings, (offset, axisSettings) => {
  const width = typeof axisSettings.width === 'number' ? axisSettings.width : _Constants.DEFAULT_Y_AXIS_WIDTH;
  return {
    width,
    height: offset.height
  };
});
const selectCartesianAxisSize = (state, axisType, axisId) => {
  switch (axisType) {
    case 'xAxis':
      {
        return selectXAxisSize(state, axisId).width;
      }
    case 'yAxis':
      {
        return selectYAxisSize(state, axisId).height;
      }
    default:
      {
        return undefined;
      }
  }
};
exports.selectCartesianAxisSize = selectCartesianAxisSize;
const combineDuplicateDomain = (chartLayout, appliedValues, axis, axisType) => {
  if (axis == null) {
    return undefined;
  }
  const {
    allowDuplicatedCategory,
    type,
    dataKey
  } = axis;
  const isCategorical = (0, _ChartUtils.isCategoricalAxis)(chartLayout, axisType);
  const allData = appliedValues.map(av => av.value);
  if (dataKey && isCategorical && type === 'category' && allowDuplicatedCategory && (0, _DataUtils.hasDuplicate)(allData)) {
    return allData;
  }
  return undefined;
};
exports.combineDuplicateDomain = combineDuplicateDomain;
const selectDuplicateDomain = exports.selectDuplicateDomain = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, selectAllAppliedValues, selectBaseAxis, _pickAxisType.pickAxisType], combineDuplicateDomain);
const combineCategoricalDomain = (layout, appliedValues, axis, axisType) => {
  if (axis == null || axis.dataKey == null) {
    return undefined;
  }
  const {
    type,
    scale
  } = axis;
  const isCategorical = (0, _ChartUtils.isCategoricalAxis)(layout, axisType);
  if (isCategorical && (type === 'number' || scale !== 'auto')) {
    return appliedValues.map(d => d.value);
  }
  return undefined;
};
exports.combineCategoricalDomain = combineCategoricalDomain;
const selectCategoricalDomain = exports.selectCategoricalDomain = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, selectAllAppliedValues, selectAxisSettings, _pickAxisType.pickAxisType], combineCategoricalDomain);
const selectAxisPropsNeededForCartesianGridTicksGenerator = exports.selectAxisPropsNeededForCartesianGridTicksGenerator = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, selectCartesianAxisSettings, selectRealScaleType, selectAxisScale, selectDuplicateDomain, selectCategoricalDomain, selectAxisRange, selectNiceTicks, _pickAxisType.pickAxisType], (layout, axis, realScaleType, scale, duplicateDomain, categoricalDomain, axisRange, niceTicks, axisType) => {
  if (axis == null) {
    return null;
  }
  const isCategorical = (0, _ChartUtils.isCategoricalAxis)(layout, axisType);
  return {
    angle: axis.angle,
    interval: axis.interval,
    minTickGap: axis.minTickGap,
    orientation: axis.orientation,
    tick: axis.tick,
    tickCount: axis.tickCount,
    tickFormatter: axis.tickFormatter,
    ticks: axis.ticks,
    type: axis.type,
    unit: axis.unit,
    axisType,
    categoricalDomain,
    duplicateDomain,
    isCategorical,
    niceTicks,
    range: axisRange,
    realScaleType,
    scale
  };
});
const combineAxisTicks = (layout, axis, realScaleType, scale, niceTicks, axisRange, duplicateDomain, categoricalDomain, axisType) => {
  if (axis == null || scale == null) {
    return undefined;
  }
  const isCategorical = (0, _ChartUtils.isCategoricalAxis)(layout, axisType);
  const {
    type,
    ticks,
    tickCount
  } = axis;

  // This is testing for `scaleBand` but for band axis the type is reported as `band` so this looks like a dead code with a workaround elsewhere?
  const offsetForBand = realScaleType === 'scaleBand' && typeof scale.bandwidth === 'function' ? scale.bandwidth() / 2 : 2;
  let offset = type === 'category' && scale.bandwidth ? scale.bandwidth() / offsetForBand : 0;
  offset = axisType === 'angleAxis' && axisRange != null && axisRange.length >= 2 ? (0, _DataUtils.mathSign)(axisRange[0] - axisRange[1]) * 2 * offset : offset;

  // The ticks set by user should only affect the ticks adjacent to axis line
  const ticksOrNiceTicks = ticks || niceTicks;
  if (ticksOrNiceTicks) {
    const result = ticksOrNiceTicks.map((entry, index) => {
      const scaleContent = duplicateDomain ? duplicateDomain.indexOf(entry) : entry;
      return {
        index,
        // If the scaleContent is not a number, the coordinate will be NaN.
        // That could be the case for example with a PointScale and a string as domain.
        coordinate: scale(scaleContent) + offset,
        value: entry,
        offset
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
  if (scale.ticks) {
    return scale.ticks(tickCount)
    // @ts-expect-error why does the offset go here? The type does not require it
    .map(entry => ({
      coordinate: scale(entry) + offset,
      value: entry,
      offset
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
exports.combineAxisTicks = combineAxisTicks;
const selectTicksOfAxis = exports.selectTicksOfAxis = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, selectAxisSettings, selectRealScaleType, selectAxisScale, selectNiceTicks, selectAxisRange, selectDuplicateDomain, selectCategoricalDomain, _pickAxisType.pickAxisType], combineAxisTicks);
const combineGraphicalItemTicks = (layout, axis, scale, axisRange, duplicateDomain, categoricalDomain, axisType) => {
  if (axis == null || scale == null || axisRange == null || axisRange[0] === axisRange[1]) {
    return undefined;
  }
  const isCategorical = (0, _ChartUtils.isCategoricalAxis)(layout, axisType);
  const {
    tickCount
  } = axis;
  let offset = 0;
  offset = axisType === 'angleAxis' && (axisRange === null || axisRange === void 0 ? void 0 : axisRange.length) >= 2 ? (0, _DataUtils.mathSign)(axisRange[0] - axisRange[1]) * 2 * offset : offset;

  // When axis is a categorical axis, but the type of axis is number or the scale of axis is not "auto"
  if (isCategorical && categoricalDomain) {
    return categoricalDomain.map((entry, index) => ({
      coordinate: scale(entry) + offset,
      value: entry,
      index,
      offset
    }));
  }
  if (scale.ticks) {
    return scale.ticks(tickCount)
    // @ts-expect-error why does the offset go here? The type does not require it
    .map(entry => ({
      coordinate: scale(entry) + offset,
      value: entry,
      offset
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
exports.combineGraphicalItemTicks = combineGraphicalItemTicks;
const selectTicksOfGraphicalItem = exports.selectTicksOfGraphicalItem = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, selectAxisSettings, selectAxisScale, selectAxisRange, selectDuplicateDomain, selectCategoricalDomain, _pickAxisType.pickAxisType], combineGraphicalItemTicks);
const selectAxisWithScale = exports.selectAxisWithScale = (0, _reselect.createSelector)(selectBaseAxis, selectAxisScale, (axis, scale) => {
  if (axis == null || scale == null) {
    return undefined;
  }
  return _objectSpread(_objectSpread({}, axis), {}, {
    scale
  });
});
const selectZAxisScale = (0, _reselect.createSelector)([selectBaseAxis, selectRealScaleType, selectAxisDomain, selectAxisRangeWithReverse], combineScaleFunction);
const selectZAxisWithScale = exports.selectZAxisWithScale = (0, _reselect.createSelector)((state, _axisType, axisId) => selectZAxisSettings(state, axisId), selectZAxisScale, (axis, scale) => {
  if (axis == null || scale == null) {
    return undefined;
  }
  return _objectSpread(_objectSpread({}, axis), {}, {
    scale
  });
});

/**
 * We are also going to need to implement polar chart directions if we want to support keyboard controls for those.
 */

const selectChartDirection = exports.selectChartDirection = (0, _reselect.createSelector)([_chartLayoutContext.selectChartLayout, _selectAllAxes.selectAllXAxes, _selectAllAxes.selectAllYAxes], (layout, allXAxes, allYAxes) => {
  switch (layout) {
    case 'horizontal':
      {
        return allXAxes.some(axis => axis.reversed) ? 'right-to-left' : 'left-to-right';
      }
    case 'vertical':
      {
        return allYAxes.some(axis => axis.reversed) ? 'bottom-to-top' : 'top-to-bottom';
      }
    // TODO: make this better. For now, right arrow triggers "forward", left arrow "back"
    // however, the tooltip moves an unintuitive direction because of how the indices are rendered
    case 'centric':
    case 'radial':
      {
        return 'left-to-right';
      }
    default:
      {
        return undefined;
      }
  }
});
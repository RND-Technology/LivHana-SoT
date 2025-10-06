"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useBrushChartSynchronisation = useBrushChartSynchronisation;
exports.useSynchronisedEventsFromOtherCharts = useSynchronisedEventsFromOtherCharts;
exports.useTooltipChartSynchronisation = useTooltipChartSynchronisation;
const _react = require("react");
const _hooks = require("../state/hooks");
const _rootPropsSelectors = require("../state/selectors/rootPropsSelectors");
const _Events = require("../util/Events");
const _optionsSlice = require("../state/optionsSlice");
const _tooltipSlice = require("../state/tooltipSlice");
const _selectors = require("../state/selectors/selectors");
const _tooltipSelectors = require("../state/selectors/tooltipSelectors");
const _syncSelectors = require("./syncSelectors");
const _chartLayoutContext = require("../context/chartLayoutContext");
const _chartDataSlice = require("../state/chartDataSlice");
const _excluded = ["x", "y"];
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; let o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { const n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; const t = {}; for (const n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
const noop = () => {};
function useTooltipSyncEventsListener() {
  const mySyncId = (0, _hooks.useAppSelector)(_rootPropsSelectors.selectSyncId);
  const myEventEmitter = (0, _hooks.useAppSelector)(_rootPropsSelectors.selectEventEmitter);
  const dispatch = (0, _hooks.useAppDispatch)();
  const syncMethod = (0, _hooks.useAppSelector)(_rootPropsSelectors.selectSyncMethod);
  const tooltipTicks = (0, _hooks.useAppSelector)(_tooltipSelectors.selectTooltipAxisTicks);
  const layout = (0, _chartLayoutContext.useChartLayout)();
  const viewBox = (0, _chartLayoutContext.useViewBox)();
  const className = (0, _hooks.useAppSelector)(state => state.rootProps.className);
  (0, _react.useEffect)(() => {
    if (mySyncId == null) {
      // This chart is not synchronised with any other chart so we don't need to listen for any events.
      return noop;
    }
    const listener = (incomingSyncId, action, emitter) => {
      if (myEventEmitter === emitter) {
        // We don't want to dispatch actions that we sent ourselves.
        return;
      }
      if (mySyncId !== incomingSyncId) {
        // This event is not for this chart
        return;
      }
      if (syncMethod === 'index') {
        let _action$payload;
        if (viewBox && action !== null && action !== void 0 && (_action$payload = action.payload) !== null && _action$payload !== void 0 && _action$payload.coordinate) {
          const _action$payload$coord = action.payload.coordinate,
            {
              x: _x,
              y: _y
            } = _action$payload$coord,
            otherCoordinateProps = _objectWithoutProperties(_action$payload$coord, _excluded);
          const boundedCoordinate = _objectSpread(_objectSpread(_objectSpread({}, otherCoordinateProps), typeof _x === 'number' && {
            x: Math.max(viewBox.x, Math.min(_x, viewBox.x + viewBox.width))
          }), typeof _y === 'number' && {
            y: Math.max(viewBox.y, Math.min(_y, viewBox.y + viewBox.height))
          });
          const boundedAction = _objectSpread(_objectSpread({}, action), {}, {
            payload: _objectSpread(_objectSpread({}, action.payload), {}, {
              coordinate: boundedCoordinate
            })
          });
          dispatch(boundedAction);
        } else {
          dispatch(action);
        }
        return;
      }
      if (tooltipTicks == null) {
        // for the other two sync methods, we need the ticks to be available
        return;
      }
      let activeTick;
      if (typeof syncMethod === 'function') {
        /*
         * This is what the data shape in 2.x CategoricalChartState used to look like.
         * In 3.x we store things differently but let's try to keep the old shape for compatibility.
         */
        const syncMethodParam = {
          activeTooltipIndex: action.payload.index == null ? undefined : Number(action.payload.index),
          isTooltipActive: action.payload.active,
          activeIndex: action.payload.index == null ? undefined : Number(action.payload.index),
          activeLabel: action.payload.label,
          activeDataKey: action.payload.dataKey,
          activeCoordinate: action.payload.coordinate
        };
        // Call a callback function. If there is an application specific algorithm
        const activeTooltipIndex = syncMethod(tooltipTicks, syncMethodParam);
        activeTick = tooltipTicks[activeTooltipIndex];
      } else if (syncMethod === 'value') {
        // labels are always strings, tick.value might be a string or a number, depending on axis type
        activeTick = tooltipTicks.find(tick => String(tick.value) === action.payload.label);
      }
      const {
        coordinate
      } = action.payload;
      if (activeTick == null || action.payload.active === false || coordinate == null || viewBox == null) {
        dispatch((0, _tooltipSlice.setSyncInteraction)({
          active: false,
          coordinate: undefined,
          dataKey: undefined,
          index: null,
          label: undefined
        }));
        return;
      }
      const {
        x,
        y
      } = coordinate;
      const validateChartX = Math.min(x, viewBox.x + viewBox.width);
      const validateChartY = Math.min(y, viewBox.y + viewBox.height);
      const activeCoordinate = {
        x: layout === 'horizontal' ? activeTick.coordinate : validateChartX,
        y: layout === 'horizontal' ? validateChartY : activeTick.coordinate
      };
      const syncAction = (0, _tooltipSlice.setSyncInteraction)({
        active: action.payload.active,
        coordinate: activeCoordinate,
        dataKey: action.payload.dataKey,
        index: String(activeTick.index),
        label: action.payload.label
      });
      dispatch(syncAction);
    };
    _Events.eventCenter.on(_Events.TOOLTIP_SYNC_EVENT, listener);
    return () => {
      _Events.eventCenter.off(_Events.TOOLTIP_SYNC_EVENT, listener);
    };
  }, [className, dispatch, myEventEmitter, mySyncId, syncMethod, tooltipTicks, layout, viewBox]);
}
function useBrushSyncEventsListener() {
  const mySyncId = (0, _hooks.useAppSelector)(_rootPropsSelectors.selectSyncId);
  const myEventEmitter = (0, _hooks.useAppSelector)(_rootPropsSelectors.selectEventEmitter);
  const dispatch = (0, _hooks.useAppDispatch)();
  (0, _react.useEffect)(() => {
    if (mySyncId == null) {
      // This chart is not synchronised with any other chart so we don't need to listen for any events.
      return noop;
    }
    const listener = (incomingSyncId, action, emitter) => {
      if (myEventEmitter === emitter) {
        // We don't want to dispatch actions that we sent ourselves.
        return;
      }
      if (mySyncId === incomingSyncId) {
        dispatch((0, _chartDataSlice.setDataStartEndIndexes)(action));
      }
    };
    _Events.eventCenter.on(_Events.BRUSH_SYNC_EVENT, listener);
    return () => {
      _Events.eventCenter.off(_Events.BRUSH_SYNC_EVENT, listener);
    };
  }, [dispatch, myEventEmitter, mySyncId]);
}

/**
 * Will receive synchronisation events from other charts.
 *
 * Reads syncMethod from state and decides how to synchronise the tooltip based on that.
 *
 * @returns void
 */
function useSynchronisedEventsFromOtherCharts() {
  const dispatch = (0, _hooks.useAppDispatch)();
  (0, _react.useEffect)(() => {
    dispatch((0, _optionsSlice.createEventEmitter)());
  }, [dispatch]);
  useTooltipSyncEventsListener();
  useBrushSyncEventsListener();
}

/**
 * Will send events to other charts.
 * If syncId is undefined, no events will be sent.
 *
 * This ignores the syncMethod, because that is set and computed on the receiving end.
 *
 * @param tooltipEventType from Tooltip
 * @param trigger from Tooltip
 * @param activeCoordinate from state
 * @param activeLabel from state
 * @param activeIndex from state
 * @param isTooltipActive from state
 * @returns void
 */
function useTooltipChartSynchronisation(tooltipEventType, trigger, activeCoordinate, activeLabel, activeIndex, isTooltipActive) {
  const activeDataKey = (0, _hooks.useAppSelector)(state => (0, _selectors.selectTooltipDataKey)(state, tooltipEventType, trigger));
  const eventEmitterSymbol = (0, _hooks.useAppSelector)(_rootPropsSelectors.selectEventEmitter);
  const syncId = (0, _hooks.useAppSelector)(_rootPropsSelectors.selectSyncId);
  const syncMethod = (0, _hooks.useAppSelector)(_rootPropsSelectors.selectSyncMethod);
  const tooltipState = (0, _hooks.useAppSelector)(_syncSelectors.selectSynchronisedTooltipState);
  const isReceivingSynchronisation = tooltipState === null || tooltipState === void 0 ? void 0 : tooltipState.active;
  (0, _react.useEffect)(() => {
    if (isReceivingSynchronisation) {
      /*
       * This chart currently has active tooltip, synchronised from another chart.
       * Let's not send any outgoing synchronisation events while that's happening
       * to avoid infinite loops.
       */
      return;
    }
    if (syncId == null) {
      /*
       * syncId is not set, means that this chart is not synchronised with any other chart,
       * means we don't need to send synchronisation events
       */
      return;
    }
    if (eventEmitterSymbol == null) {
      /*
       * When using Recharts internal hooks and selectors outside charts context,
       * these properties will be undefined. Let's return silently instead of throwing an error.
       */
      return;
    }
    const syncAction = (0, _tooltipSlice.setSyncInteraction)({
      active: isTooltipActive,
      coordinate: activeCoordinate,
      dataKey: activeDataKey,
      index: activeIndex,
      label: typeof activeLabel === 'number' ? String(activeLabel) : activeLabel
    });
    _Events.eventCenter.emit(_Events.TOOLTIP_SYNC_EVENT, syncId, syncAction, eventEmitterSymbol);
  }, [isReceivingSynchronisation, activeCoordinate, activeDataKey, activeIndex, activeLabel, eventEmitterSymbol, syncId, syncMethod, isTooltipActive]);
}
function useBrushChartSynchronisation() {
  const syncId = (0, _hooks.useAppSelector)(_rootPropsSelectors.selectSyncId);
  const eventEmitterSymbol = (0, _hooks.useAppSelector)(_rootPropsSelectors.selectEventEmitter);
  const brushStartIndex = (0, _hooks.useAppSelector)(state => state.chartData.dataStartIndex);
  const brushEndIndex = (0, _hooks.useAppSelector)(state => state.chartData.dataEndIndex);
  (0, _react.useEffect)(() => {
    if (syncId == null || brushStartIndex == null || brushEndIndex == null || eventEmitterSymbol == null) {
      return;
    }
    const syncAction = {
      startIndex: brushStartIndex,
      endIndex: brushEndIndex
    };
    _Events.eventCenter.emit(_Events.BRUSH_SYNC_EVENT, syncId, syncAction, eventEmitterSymbol);
  }, [brushEndIndex, brushStartIndex, eventEmitterSymbol, syncId]);
}
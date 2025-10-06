"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SetLegendPayload = SetLegendPayload;
exports.SetPolarLegendPayload = SetPolarLegendPayload;
const _react = require("react");
const _PanoramaContext = require("../context/PanoramaContext");
const _chartLayoutContext = require("../context/chartLayoutContext");
const _hooks = require("./hooks");
const _legendSlice = require("./legendSlice");
const noop = () => {};
function SetLegendPayload(_ref) {
  const {
    legendPayload
  } = _ref;
  const dispatch = (0, _hooks.useAppDispatch)();
  const isPanorama = (0, _PanoramaContext.useIsPanorama)();
  (0, _react.useEffect)(() => {
    if (isPanorama) {
      return noop;
    }
    dispatch((0, _legendSlice.addLegendPayload)(legendPayload));
    return () => {
      dispatch((0, _legendSlice.removeLegendPayload)(legendPayload));
    };
  }, [dispatch, isPanorama, legendPayload]);
  return null;
}
function SetPolarLegendPayload(_ref2) {
  const {
    legendPayload
  } = _ref2;
  const dispatch = (0, _hooks.useAppDispatch)();
  const layout = (0, _hooks.useAppSelector)(_chartLayoutContext.selectChartLayout);
  (0, _react.useEffect)(() => {
    if (layout !== 'centric' && layout !== 'radial') {
      return noop;
    }
    dispatch((0, _legendSlice.addLegendPayload)(legendPayload));
    return () => {
      dispatch((0, _legendSlice.removeLegendPayload)(legendPayload));
    };
  }, [dispatch, layout, legendPayload]);
  return null;
}
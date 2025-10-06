"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SetTooltipEntrySettings = SetTooltipEntrySettings;
const _react = require("react");
const _hooks = require("./hooks");
const _tooltipSlice = require("./tooltipSlice");
const _PanoramaContext = require("../context/PanoramaContext");
function SetTooltipEntrySettings(_ref) {
  const {
    fn,
    args
  } = _ref;
  const dispatch = (0, _hooks.useAppDispatch)();
  const isPanorama = (0, _PanoramaContext.useIsPanorama)();
  (0, _react.useEffect)(() => {
    if (isPanorama) {
      // Panorama graphical items should never contribute to Tooltip payload.
      return undefined;
    }
    const tooltipEntrySettings = fn(args);
    dispatch((0, _tooltipSlice.addTooltipEntrySettings)(tooltipEntrySettings));
    return () => {
      dispatch((0, _tooltipSlice.removeTooltipEntrySettings)(tooltipEntrySettings));
    };
  }, [fn, args, dispatch, isPanorama]);
  return null;
}
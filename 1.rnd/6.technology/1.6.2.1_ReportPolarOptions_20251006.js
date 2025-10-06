"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReportPolarOptions = ReportPolarOptions;
const _react = require("react");
const _hooks = require("./hooks");
const _polarOptionsSlice = require("./polarOptionsSlice");
function ReportPolarOptions(props) {
  const dispatch = (0, _hooks.useAppDispatch)();
  (0, _react.useEffect)(() => {
    dispatch((0, _polarOptionsSlice.updatePolarOptions)(props));
  }, [dispatch, props]);
  return null;
}
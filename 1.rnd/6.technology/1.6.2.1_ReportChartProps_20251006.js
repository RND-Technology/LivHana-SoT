"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReportChartProps = ReportChartProps;
const _react = require("react");
const _rootPropsSlice = require("./rootPropsSlice");
const _hooks = require("./hooks");
function ReportChartProps(props) {
  const dispatch = (0, _hooks.useAppDispatch)();
  (0, _react.useEffect)(() => {
    dispatch((0, _rootPropsSlice.updateOptions)(props));
  }, [dispatch, props]);
  return null;
}
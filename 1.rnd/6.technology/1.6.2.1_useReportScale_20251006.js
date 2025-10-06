"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReportScale = useReportScale;
const _react = require("react");
const _hooks = require("../state/hooks");
const _containerSelectors = require("../state/selectors/containerSelectors");
const _layoutSlice = require("../state/layoutSlice");
const _isWellBehavedNumber = require("./isWellBehavedNumber");
function useReportScale() {
  const dispatch = (0, _hooks.useAppDispatch)();
  const [ref, setRef] = (0, _react.useState)(null);
  const scale = (0, _hooks.useAppSelector)(_containerSelectors.selectContainerScale);
  (0, _react.useEffect)(() => {
    if (ref == null) {
      return;
    }
    const rect = ref.getBoundingClientRect();
    const newScale = rect.width / ref.offsetWidth;
    if ((0, _isWellBehavedNumber.isWellBehavedNumber)(newScale) && newScale !== scale) {
      dispatch((0, _layoutSlice.setScale)(newScale));
    }
  }, [ref, dispatch, scale]);
  return setRef;
}
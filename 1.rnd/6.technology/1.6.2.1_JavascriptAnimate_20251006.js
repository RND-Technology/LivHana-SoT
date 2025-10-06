"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JavascriptAnimate = JavascriptAnimate;
const _react = require("react");
const _esToolkit = require("es-toolkit");
const _resolveDefaultProps = require("../util/resolveDefaultProps");
const _configUpdate = _interopRequireDefault(require("./configUpdate"));
const _easing = require("./easing");
const _useAnimationManager = require("./useAnimationManager");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const defaultJavascriptAnimateProps = {
  begin: 0,
  duration: 1000,
  easing: 'ease',
  isActive: true,
  canBegin: true,
  onAnimationEnd: () => {},
  onAnimationStart: () => {}
};
const from = {
  t: 0
};
const to = {
  t: 1
};
function JavascriptAnimate(outsideProps) {
  const props = (0, _resolveDefaultProps.resolveDefaultProps)(outsideProps, defaultJavascriptAnimateProps);
  const {
    isActive,
    canBegin,
    duration,
    easing,
    begin,
    onAnimationEnd,
    onAnimationStart,
    children
  } = props;
  const animationManager = (0, _useAnimationManager.useAnimationManager)(props.animationId, props.animationManager);
  const [style, setStyle] = (0, _react.useState)(isActive ? from : to);
  const stopJSAnimation = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    if (!isActive) {
      setStyle(to);
    }
  }, [isActive]);
  (0, _react.useEffect)(() => {
    if (!isActive || !canBegin) {
      return _esToolkit.noop;
    }
    const startAnimation = (0, _configUpdate.default)(from, to, (0, _easing.configEasing)(easing), duration, setStyle, animationManager.getTimeoutController());
    const onAnimationActive = () => {
      stopJSAnimation.current = startAnimation();
    };
    animationManager.start([onAnimationStart, begin, onAnimationActive, duration, onAnimationEnd]);
    return () => {
      animationManager.stop();
      if (stopJSAnimation.current) {
        stopJSAnimation.current();
      }
      onAnimationEnd();
    };
  }, [isActive, canBegin, duration, easing, begin, onAnimationStart, onAnimationEnd, animationManager]);
  return children(style.t);
}
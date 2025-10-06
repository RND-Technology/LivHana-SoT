"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CSSTransitionAnimate = CSSTransitionAnimate;
const _react = require("react");
const _esToolkit = require("es-toolkit");
const _resolveDefaultProps = require("../util/resolveDefaultProps");
const _useAnimationManager = require("./useAnimationManager");
const _util = require("./util");
const defaultProps = {
  begin: 0,
  duration: 1000,
  easing: 'ease',
  isActive: true,
  canBegin: true,
  onAnimationEnd: () => {},
  onAnimationStart: () => {}
};
function CSSTransitionAnimate(outsideProps) {
  const props = (0, _resolveDefaultProps.resolveDefaultProps)(outsideProps, defaultProps);
  const {
    animationId,
    from,
    to,
    attributeName,
    isActive,
    canBegin,
    duration,
    easing,
    begin,
    onAnimationEnd,
    onAnimationStart: onAnimationStartFromProps,
    children
  } = props;
  const animationManager = (0, _useAnimationManager.useAnimationManager)(animationId + attributeName, props.animationManager);
  const [style, setStyle] = (0, _react.useState)(() => {
    if (!isActive) {
      return to;
    }
    return from;
  });
  const initialized = (0, _react.useRef)(false);
  const onAnimationStart = (0, _react.useCallback)(() => {
    setStyle(from);
    onAnimationStartFromProps();
  }, [from, onAnimationStartFromProps]);
  (0, _react.useEffect)(() => {
    if (!isActive || !canBegin) {
      return _esToolkit.noop;
    }
    initialized.current = true;
    const unsubscribe = animationManager.subscribe(setStyle);
    animationManager.start([onAnimationStart, begin, to, duration, onAnimationEnd]);
    return () => {
      animationManager.stop();
      if (unsubscribe) {
        unsubscribe();
      }
      onAnimationEnd();
    };
  }, [isActive, canBegin, duration, easing, begin, onAnimationStart, onAnimationEnd, animationManager, to, from]);
  if (!isActive) {
    /*
     * With isActive=false, the component always renders with the final style, immediately,
     * and ignores all other props.
     * Also there is no transition applied.
     */
    return children({
      [attributeName]: to
    });
  }
  if (!canBegin) {
    return children({
      [attributeName]: from
    });
  }
  if (initialized.current) {
    const transition = (0, _util.getTransitionVal)([attributeName], duration, easing);
    return children({
      transition,
      [attributeName]: style
    });
  }
  return children({
    [attributeName]: from
  });
}
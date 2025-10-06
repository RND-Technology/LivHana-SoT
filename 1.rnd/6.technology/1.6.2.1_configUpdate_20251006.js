"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.alpha = void 0;
const _util = require("./util");
function ownKeys(e, r) { const t = Object.keys(e); if (Object.getOwnPropertySymbols) { let o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (let r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { const i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; const e = t[Symbol.toPrimitive]; if (void 0 !== e) { const i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const alpha = (begin, end, k) => begin + (end - begin) * k;
exports.alpha = alpha;
const needContinue = _ref => {
  const {
    from,
    to
  } = _ref;
  return from !== to;
};
/*
 * @description: cal new from value and velocity in each stepper
 * @return: { [styleProperty]: { from, to, velocity } }
 */
const calStepperVals = (easing, preVals, steps) => {
  const nextStepVals = (0, _util.mapObject)((key, val) => {
    if (needContinue(val)) {
      const [newX, newV] = easing(val.from, val.to, val.velocity);
      return _objectSpread(_objectSpread({}, val), {}, {
        from: newX,
        velocity: newV
      });
    }
    return val;
  }, preVals);
  if (steps < 1) {
    return (0, _util.mapObject)((key, val) => {
      if (needContinue(val)) {
        return _objectSpread(_objectSpread({}, val), {}, {
          velocity: alpha(val.velocity, nextStepVals[key].velocity, steps),
          from: alpha(val.from, nextStepVals[key].from, steps)
        });
      }
      return val;
    }, preVals);
  }
  return calStepperVals(easing, nextStepVals, steps - 1);
};
function createStepperUpdate(from, to, easing, interKeys, render, timeoutController) {
  let preTime;
  let stepperStyle = interKeys.reduce((res, key) => _objectSpread(_objectSpread({}, res), {}, {
    [key]: {
      from: from[key],
      velocity: 0,
      to: to[key]
    }
  }), {});
  const getCurrStyle = () => (0, _util.mapObject)((key, val) => val.from, stepperStyle);
  const shouldStopAnimation = () => !Object.values(stepperStyle).filter(needContinue).length;
  let stopAnimation = null;
  const stepperUpdate = now => {
    if (!preTime) {
      preTime = now;
    }
    const deltaTime = now - preTime;
    const steps = deltaTime / easing.dt;
    stepperStyle = calStepperVals(easing, stepperStyle, steps);
    // get union set and add compatible prefix
    render(_objectSpread(_objectSpread(_objectSpread({}, from), to), getCurrStyle()));
    preTime = now;
    if (!shouldStopAnimation()) {
      stopAnimation = timeoutController.setTimeout(stepperUpdate);
    }
  };

  // return start animation method
  return () => {
    stopAnimation = timeoutController.setTimeout(stepperUpdate);

    // return stop animation method
    return () => {
      stopAnimation();
    };
  };
}
function createTimingUpdate(from, to, easing, duration, interKeys, render, timeoutController) {
  let stopAnimation = null;
  const timingStyle = interKeys.reduce((res, key) => _objectSpread(_objectSpread({}, res), {}, {
    [key]: [from[key], to[key]]
  }), {});
  let beginTime;
  const timingUpdate = now => {
    if (!beginTime) {
      beginTime = now;
    }
    const t = (now - beginTime) / duration;
    const currStyle = (0, _util.mapObject)((key, val) => alpha(...val, easing(t)), timingStyle);

    // get union set and add compatible prefix
    render(_objectSpread(_objectSpread(_objectSpread({}, from), to), currStyle));
    if (t < 1) {
      stopAnimation = timeoutController.setTimeout(timingUpdate);
    } else {
      const finalStyle = (0, _util.mapObject)((key, val) => alpha(...val, easing(1)), timingStyle);
      render(_objectSpread(_objectSpread(_objectSpread({}, from), to), finalStyle));
    }
  };

  // return start animation method
  return () => {
    stopAnimation = timeoutController.setTimeout(timingUpdate);

    // return stop animation method
    return () => {
      stopAnimation();
    };
  };
}

// configure update function
// eslint-disable-next-line import/no-default-export
const _default = (from, to, easing, duration, render, timeoutController) => {
  const interKeys = (0, _util.getIntersectionKeys)(from, to);
  return easing.isStepper === true ? createStepperUpdate(from, to, easing, interKeys, render, timeoutController) : createTimingUpdate(from, to, easing, duration, interKeys, render, timeoutController);
};
exports.default = _default;
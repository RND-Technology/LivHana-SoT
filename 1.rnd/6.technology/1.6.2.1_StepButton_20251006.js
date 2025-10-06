"use strict";
'use client';

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
const _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
const React = _interopRequireWildcard(require("react"));
const _propTypes = _interopRequireDefault(require("prop-types"));
const _clsx = _interopRequireDefault(require("clsx"));
const _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
const _styled = _interopRequireDefault(require("../styles/styled"));
const _DefaultPropsProvider = require("../DefaultPropsProvider");
const _ButtonBase = _interopRequireDefault(require("../ButtonBase"));
const _StepLabel = _interopRequireDefault(require("../StepLabel"));
const _isMuiElement = _interopRequireDefault(require("../utils/isMuiElement"));
const _StepperContext = _interopRequireDefault(require("../Stepper/StepperContext"));
const _StepContext = _interopRequireDefault(require("../Step/StepContext"));
const _stepButtonClasses = _interopRequireWildcard(require("./stepButtonClasses"));
const _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["children", "className", "icon", "optional"];
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; const r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; const t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); const n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (const u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { const i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const useUtilityClasses = ownerState => {
  const {
    classes,
    orientation
  } = ownerState;
  const slots = {
    root: ['root', orientation],
    touchRipple: ['touchRipple']
  };
  return (0, _composeClasses.default)(slots, _stepButtonClasses.getStepButtonUtilityClass, classes);
};
const StepButtonRoot = (0, _styled.default)(_ButtonBase.default, {
  name: 'MuiStepButton',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const {
      ownerState
    } = props;
    return [{
      [`& .${_stepButtonClasses.default.touchRipple}`]: styles.touchRipple
    }, styles.root, styles[ownerState.orientation]];
  }
})(({
  ownerState
}) => (0, _extends2.default)({
  width: '100%',
  padding: '24px 16px',
  margin: '-24px -16px',
  boxSizing: 'content-box'
}, ownerState.orientation === 'vertical' && {
  justifyContent: 'flex-start',
  padding: '8px',
  margin: '-8px'
}, {
  [`& .${_stepButtonClasses.default.touchRipple}`]: {
    color: 'rgba(0, 0, 0, 0.3)'
  }
}));
const StepButton = /*#__PURE__*/React.forwardRef(function StepButton(inProps, ref) {
  const props = (0, _DefaultPropsProvider.useDefaultProps)({
    props: inProps,
    name: 'MuiStepButton'
  });
  const {
      children,
      className,
      icon,
      optional
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const {
    disabled,
    active
  } = React.useContext(_StepContext.default);
  const {
    orientation
  } = React.useContext(_StepperContext.default);
  const ownerState = (0, _extends2.default)({}, props, {
    orientation
  });
  const classes = useUtilityClasses(ownerState);
  const childProps = {
    icon,
    optional
  };
  const child = (0, _isMuiElement.default)(children, ['StepLabel']) ? ( /*#__PURE__*/React.cloneElement(children, childProps)) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_StepLabel.default, (0, _extends2.default)({}, childProps, {
    children: children
  }));
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(StepButtonRoot, (0, _extends2.default)({
    focusRipple: true,
    disabled: disabled,
    TouchRippleProps: {
      className: classes.touchRipple
    },
    className: (0, _clsx.default)(classes.root, className),
    ref: ref,
    ownerState: ownerState,
    "aria-current": active ? 'step' : undefined
  }, other, {
    children: child
  }));
});
process.env.NODE_ENV !== "production" ? StepButton.propTypes /* remove-proptypes */ = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Can be a `StepLabel` or a node to place inside `StepLabel` as children.
   */
  children: _propTypes.default.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: _propTypes.default.object,
  /**
   * @ignore
   */
  className: _propTypes.default.string,
  /**
   * The icon displayed by the step label.
   */
  icon: _propTypes.default.node,
  /**
   * The optional node to display.
   */
  optional: _propTypes.default.node,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object])
} : void 0;
const _default = exports.default = StepButton;
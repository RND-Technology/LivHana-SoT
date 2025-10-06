"use strict";
'use client';

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
const React = _interopRequireWildcard(require("react"));
const _propTypes = _interopRequireDefault(require("prop-types"));
const _RadioButtonUnchecked = _interopRequireDefault(require("../internal/svg-icons/RadioButtonUnchecked"));
const _RadioButtonChecked = _interopRequireDefault(require("../internal/svg-icons/RadioButtonChecked"));
const _styled = _interopRequireWildcard(require("../styles/styled"));
const _jsxRuntime = require("react/jsx-runtime");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; const r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; const t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); const n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (const u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { const i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const RadioButtonIconRoot = (0, _styled.default)('span', {
  name: 'MuiRadioButtonIcon',
  shouldForwardProp: _styled.rootShouldForwardProp
})({
  position: 'relative',
  display: 'flex'
});
const RadioButtonIconBackground = (0, _styled.default)(_RadioButtonUnchecked.default, {
  name: 'MuiRadioButtonIcon'
})({
  // Scale applied to prevent dot misalignment in Safari
  transform: 'scale(1)'
});
const RadioButtonIconDot = (0, _styled.default)(_RadioButtonChecked.default, {
  name: 'MuiRadioButtonIcon'
})(({
  theme,
  ownerState
}) => (0, _extends2.default)({
  left: 0,
  position: 'absolute',
  transform: 'scale(0)',
  transition: theme.transitions.create('transform', {
    easing: theme.transitions.easing.easeIn,
    duration: theme.transitions.duration.shortest
  })
}, ownerState.checked && {
  transform: 'scale(1)',
  transition: theme.transitions.create('transform', {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.shortest
  })
}));

/**
 * @ignore - internal component.
 */
function RadioButtonIcon(props) {
  const {
    checked = false,
    classes = {},
    fontSize
  } = props;
  const ownerState = (0, _extends2.default)({}, props, {
    checked
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(RadioButtonIconRoot, {
    className: classes.root,
    ownerState: ownerState,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(RadioButtonIconBackground, {
      fontSize: fontSize,
      className: classes.background,
      ownerState: ownerState
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(RadioButtonIconDot, {
      fontSize: fontSize,
      className: classes.dot,
      ownerState: ownerState
    })]
  });
}
process.env.NODE_ENV !== "production" ? RadioButtonIcon.propTypes = {
  /**
   * If `true`, the component is checked.
   */
  checked: _propTypes.default.bool,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: _propTypes.default.object,
  /**
   * The size of the component.
   * `small` is equivalent to the dense radio styling.
   */
  fontSize: _propTypes.default.oneOf(['small', 'medium'])
} : void 0;
const _default = exports.default = RadioButtonIcon;
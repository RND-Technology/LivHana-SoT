"use strict";
'use client';

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = SliderValueLabel;
const React = _interopRequireWildcard(require("react"));
const _propTypes = _interopRequireDefault(require("prop-types"));
const _clsx = _interopRequireDefault(require("clsx"));
const _sliderClasses = _interopRequireDefault(require("./sliderClasses"));
const _jsxRuntime = require("react/jsx-runtime");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; const r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; const t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); const n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (const u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { const i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const useValueLabelClasses = props => {
  const {
    open
  } = props;
  const utilityClasses = {
    offset: (0, _clsx.default)(open && _sliderClasses.default.valueLabelOpen),
    circle: _sliderClasses.default.valueLabelCircle,
    label: _sliderClasses.default.valueLabelLabel
  };
  return utilityClasses;
};

/**
 * @ignore - internal component.
 */
function SliderValueLabel(props) {
  const {
    children,
    className,
    value
  } = props;
  const classes = useValueLabelClasses(props);
  if (!children) {
    return null;
  }
  return /*#__PURE__*/React.cloneElement(children, {
    className: (0, _clsx.default)(children.props.className)
  }, /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
    children: [children.props.children, /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: (0, _clsx.default)(classes.offset, className),
      "aria-hidden": true,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: classes.circle,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: classes.label,
          children: value
        })
      })
    })]
  }));
}
process.env.NODE_ENV !== "production" ? SliderValueLabel.propTypes = {
  children: _propTypes.default.element.isRequired,
  className: _propTypes.default.string,
  value: _propTypes.default.node
} : void 0;
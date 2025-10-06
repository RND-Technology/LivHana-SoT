"use strict";
'use client';

const _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ScrollbarSize;
const _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
const _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
const React = _interopRequireWildcard(require("react"));
const _propTypes = _interopRequireDefault(require("prop-types"));
const _debounce = _interopRequireDefault(require("../utils/debounce"));
const _utils = require("../utils");
const _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["onChange"];
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; const r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; const t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); const n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (const u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { const i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const styles = {
  width: 99,
  height: 99,
  position: 'absolute',
  top: -9999,
  overflow: 'scroll'
};

/**
 * @ignore - internal component.
 * The component originates from https://github.com/STORIS/react-scrollbar-size.
 * It has been moved into the core in order to minimize the bundle size.
 */
function ScrollbarSize(props) {
  const {
      onChange
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const scrollbarHeight = React.useRef();
  const nodeRef = React.useRef(null);
  const setMeasurements = () => {
    scrollbarHeight.current = nodeRef.current.offsetHeight - nodeRef.current.clientHeight;
  };
  (0, _utils.unstable_useEnhancedEffect)(() => {
    const handleResize = (0, _debounce.default)(() => {
      const prevHeight = scrollbarHeight.current;
      setMeasurements();
      if (prevHeight !== scrollbarHeight.current) {
        onChange(scrollbarHeight.current);
      }
    });
    const containerWindow = (0, _utils.ownerWindow)(nodeRef.current);
    containerWindow.addEventListener('resize', handleResize);
    return () => {
      handleResize.clear();
      containerWindow.removeEventListener('resize', handleResize);
    };
  }, [onChange]);
  React.useEffect(() => {
    setMeasurements();
    onChange(scrollbarHeight.current);
  }, [onChange]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", (0, _extends2.default)({
    style: styles
  }, other, {
    ref: nodeRef
  }));
}
process.env.NODE_ENV !== "production" ? ScrollbarSize.propTypes = {
  onChange: _propTypes.default.func.isRequired
} : void 0;
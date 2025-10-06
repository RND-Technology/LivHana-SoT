'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const emotionElement = require('./emotion-element-af3dc15b.edge-light.cjs.js');
const React = require('react');
const utils = require('@emotion/utils');
const useInsertionEffectWithFallbacks = require('@emotion/use-insertion-effect-with-fallbacks');
const serialize = require('@emotion/serialize');
require('@emotion/cache');
require('@babel/runtime/helpers/extends');
require('@emotion/weak-memoize');
require('../_isolated-hnrs/dist/emotion-react-_isolated-hnrs.edge-light.cjs.js');
require('hoist-non-react-statics');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  const n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

const React__namespace = /*#__PURE__*/_interopNamespace(React);

exports.jsx = function jsx(type, props) {
  // eslint-disable-next-line prefer-rest-params
  const args = arguments;

  if (props == null || !emotionElement.hasOwn.call(props, 'css')) {
    return React__namespace.createElement.apply(undefined, args);
  }

  const argsLength = args.length;
  const createElementArgArray = new Array(argsLength);
  createElementArgArray[0] = emotionElement.Emotion;
  createElementArgArray[1] = emotionElement.createEmotionProps(type, props);

  for (let i = 2; i < argsLength; i++) {
    createElementArgArray[i] = args[i];
  }

  return React__namespace.createElement.apply(null, createElementArgArray);
};

(function (_jsx) {
  let JSX;

  (function (_JSX) {})(JSX || (JSX = _jsx.JSX || (_jsx.JSX = {})));
})(exports.jsx || (exports.jsx = {}));

// initial render from browser, insertBefore context.sheet.tags[0] or if a style hasn't been inserted there yet, appendChild
// initial client-side render from SSR, use place of hydrating tag

const Global = /* #__PURE__ */emotionElement.withEmotionCache(function (props, cache) {

  const styles = props.styles;
  const serialized = serialize.serializeStyles([styles], undefined, React__namespace.useContext(emotionElement.ThemeContext));

  {
    let _ref;

    let serializedNames = serialized.name;
    let serializedStyles = serialized.styles;
    let next = serialized.next;

    while (next !== undefined) {
      serializedNames += ' ' + next.name;
      serializedStyles += next.styles;
      next = next.next;
    }

    const shouldCache = cache.compat === true;
    const rules = cache.insert("", {
      name: serializedNames,
      styles: serializedStyles
    }, cache.sheet, shouldCache);

    if (shouldCache) {
      return null;
    }

    return /*#__PURE__*/React__namespace.createElement("style", (_ref = {}, _ref["data-emotion"] = cache.key + "-global " + serializedNames, _ref.dangerouslySetInnerHTML = {
      __html: rules
    }, _ref.nonce = cache.sheet.nonce, _ref));
  } // yes, i know these hooks are used conditionally
});

function css() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return serialize.serializeStyles(args);
}

function keyframes() {
  const insertable = css.apply(void 0, arguments);
  const name = "animation-" + insertable.name;
  return {
    name: name,
    styles: "@keyframes " + name + "{" + insertable.styles + "}",
    anim: 1,
    toString: function toString() {
      return "_EMO_" + this.name + "_" + this.styles + "_EMO_";
    }
  };
}

const classnames = function classnames(args) {
  const len = args.length;
  let i = 0;
  let cls = '';

  for (; i < len; i++) {
    const arg = args[i];
    if (arg == null) continue;
    let toAdd = void 0;

    switch (typeof arg) {
      case 'boolean':
        break;

      case 'object':
        {
          if (Array.isArray(arg)) {
            toAdd = classnames(arg);
          } else {

            toAdd = '';

            for (const k in arg) {
              if (arg[k] && k) {
                toAdd && (toAdd += ' ');
                toAdd += k;
              }
            }
          }

          break;
        }

      default:
        {
          toAdd = arg;
        }
    }

    if (toAdd) {
      cls && (cls += ' ');
      cls += toAdd;
    }
  }

  return cls;
};

function merge(registered, css, className) {
  const registeredStyles = [];
  const rawClassName = utils.getRegisteredStyles(registered, registeredStyles, className);

  if (registeredStyles.length < 2) {
    return className;
  }

  return rawClassName + css(registeredStyles);
}

const Insertion = function Insertion(_ref) {
  const cache = _ref.cache,
      serializedArr = _ref.serializedArr;
  const rules = useInsertionEffectWithFallbacks.useInsertionEffectAlwaysWithSyncFallback(function () {
    let rules = '';

    for (let i = 0; i < serializedArr.length; i++) {
      const res = utils.insertStyles(cache, serializedArr[i], false);

      if (res !== undefined) {
        rules += res;
      }
    }

    {
      return rules;
    }
  });

  if (rules.length !== 0) {
    let _ref2;

    return /*#__PURE__*/React__namespace.createElement("style", (_ref2 = {}, _ref2["data-emotion"] = cache.key + " " + serializedArr.map(function (serialized) {
      return serialized.name;
    }).join(' '), _ref2.dangerouslySetInnerHTML = {
      __html: rules
    }, _ref2.nonce = cache.sheet.nonce, _ref2));
  }

  return null;
};

const ClassNames = /* #__PURE__ */emotionElement.withEmotionCache(function (props, cache) {
  let hasRendered = false;
  const serializedArr = [];

  const css = function css() {
    if (hasRendered && emotionElement.isDevelopment) {
      throw new Error('css can only be used during render');
    }

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    const serialized = serialize.serializeStyles(args, cache.registered);
    serializedArr.push(serialized); // registration has to happen here as the result of this might get consumed by `cx`

    utils.registerStyles(cache, serialized, false);
    return cache.key + "-" + serialized.name;
  };

  const cx = function cx() {
    if (hasRendered && emotionElement.isDevelopment) {
      throw new Error('cx can only be used during render');
    }

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return merge(cache.registered, css, classnames(args));
  };

  const content = {
    css: css,
    cx: cx,
    theme: React__namespace.useContext(emotionElement.ThemeContext)
  };
  const ele = props.children(content);
  hasRendered = true;
  return /*#__PURE__*/React__namespace.createElement(React__namespace.Fragment, null, /*#__PURE__*/React__namespace.createElement(Insertion, {
    cache: cache,
    serializedArr: serializedArr
  }), ele);
});

exports.CacheProvider = emotionElement.CacheProvider;
exports.ThemeContext = emotionElement.ThemeContext;
exports.ThemeProvider = emotionElement.ThemeProvider;
exports.__unsafe_useEmotionCache = emotionElement.__unsafe_useEmotionCache;
exports.useTheme = emotionElement.useTheme;
Object.defineProperty(exports, 'withEmotionCache', {
  enumerable: true,
  get: function () { return emotionElement.withEmotionCache; }
});
exports.withTheme = emotionElement.withTheme;
exports.ClassNames = ClassNames;
exports.Global = Global;
exports.createElement = exports.jsx;
exports.css = css;
exports.keyframes = keyframes;

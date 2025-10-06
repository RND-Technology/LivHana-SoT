'use strict';

const React = require('react');
const createCache = require('@emotion/cache');
const _extends = require('@babel/runtime/helpers/extends');
const weakMemoize = require('@emotion/weak-memoize');
const _isolatedHnrs_dist_emotionReact_isolatedHnrs = require('../_isolated-hnrs/dist/emotion-react-_isolated-hnrs.browser.development.cjs.js');
const utils = require('@emotion/utils');
const serialize = require('@emotion/serialize');
const useInsertionEffectWithFallbacks = require('@emotion/use-insertion-effect-with-fallbacks');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

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
const createCache__default = /*#__PURE__*/_interopDefault(createCache);
const weakMemoize__default = /*#__PURE__*/_interopDefault(weakMemoize);

const EmotionCacheContext = /* #__PURE__ */React__namespace.createContext( // we're doing this to avoid preconstruct's dead code elimination in this one case
// because this module is primarily intended for the browser and node
// but it's also required in react native and similar environments sometimes
// and we could have a special build just for that
// but this is much easier and the native packages
// might use a different theme context in the future anyway
typeof HTMLElement !== 'undefined' ? /* #__PURE__ */createCache__default["default"]({
  key: 'css'
}) : null);

{
  EmotionCacheContext.displayName = 'EmotionCacheContext';
}

const CacheProvider = EmotionCacheContext.Provider;
const __unsafe_useEmotionCache = function useEmotionCache() {
  return React.useContext(EmotionCacheContext);
};

const withEmotionCache = function withEmotionCache(func) {
  return /*#__PURE__*/React.forwardRef(function (props, ref) {
    // the cache will never be null in the browser
    const cache = React.useContext(EmotionCacheContext);
    return func(props, cache, ref);
  });
};

const ThemeContext = /* #__PURE__ */React__namespace.createContext({});

{
  ThemeContext.displayName = 'EmotionThemeContext';
}

const useTheme = function useTheme() {
  return React__namespace.useContext(ThemeContext);
};

const getTheme = function getTheme(outerTheme, theme) {
  if (typeof theme === 'function') {
    const mergedTheme = theme(outerTheme);

    if ((mergedTheme == null || typeof mergedTheme !== 'object' || Array.isArray(mergedTheme))) {
      throw new Error('[ThemeProvider] Please return an object from your theme function, i.e. theme={() => ({})}!');
    }

    return mergedTheme;
  }

  if ((theme == null || typeof theme !== 'object' || Array.isArray(theme))) {
    throw new Error('[ThemeProvider] Please make your theme prop a plain object');
  }

  return _extends({}, outerTheme, theme);
};

const createCacheWithTheme = /* #__PURE__ */weakMemoize__default["default"](function (outerTheme) {
  return weakMemoize__default["default"](function (theme) {
    return getTheme(outerTheme, theme);
  });
});
const ThemeProvider = function ThemeProvider(props) {
  let theme = React__namespace.useContext(ThemeContext);

  if (props.theme !== theme) {
    theme = createCacheWithTheme(theme)(props.theme);
  }

  return /*#__PURE__*/React__namespace.createElement(ThemeContext.Provider, {
    value: theme
  }, props.children);
};
function withTheme(Component) {
  const componentName = Component.displayName || Component.name || 'Component';
  const WithTheme = /*#__PURE__*/React__namespace.forwardRef(function render(props, ref) {
    const theme = React__namespace.useContext(ThemeContext);
    return /*#__PURE__*/React__namespace.createElement(Component, _extends({
      theme: theme,
      ref: ref
    }, props));
  });
  WithTheme.displayName = "WithTheme(" + componentName + ")";
  return _isolatedHnrs_dist_emotionReact_isolatedHnrs["default"](WithTheme, Component);
}

const hasOwn = {}.hasOwnProperty;

const getLastPart = function getLastPart(functionName) {
  // The match may be something like 'Object.createEmotionProps' or
  // 'Loader.prototype.render'
  const parts = functionName.split('.');
  return parts[parts.length - 1];
};

const getFunctionNameFromStackTraceLine = function getFunctionNameFromStackTraceLine(line) {
  // V8
  let match = /^\s+at\s+([A-Za-z0-9$.]+)\s/.exec(line);
  if (match) return getLastPart(match[1]); // Safari / Firefox

  match = /^([A-Za-z0-9$.]+)@/.exec(line);
  if (match) return getLastPart(match[1]);
  return undefined;
};

const internalReactFunctionNames = /* #__PURE__ */new Set(['renderWithHooks', 'processChild', 'finishClassComponent', 'renderToString']); // These identifiers come from error stacks, so they have to be valid JS
// identifiers, thus we only need to replace what is a valid character for JS,
// but not for CSS.

const sanitizeIdentifier = function sanitizeIdentifier(identifier) {
  return identifier.replace(/\$/g, '-');
};

const getLabelFromStackTrace = function getLabelFromStackTrace(stackTrace) {
  if (!stackTrace) return undefined;
  const lines = stackTrace.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const functionName = getFunctionNameFromStackTraceLine(lines[i]); // The first line of V8 stack traces is just "Error"

    if (!functionName) continue; // If we reach one of these, we have gone too far and should quit

    if (internalReactFunctionNames.has(functionName)) break; // The component name is the first function in the stack that starts with an
    // uppercase letter

    if (/^[A-Z]/.test(functionName)) return sanitizeIdentifier(functionName);
  }

  return undefined;
};

const typePropName = '__EMOTION_TYPE_PLEASE_DO_NOT_USE__';
const labelPropName = '__EMOTION_LABEL_PLEASE_DO_NOT_USE__';
const createEmotionProps = function createEmotionProps(type, props) {
  if (typeof props.css === 'string' && // check if there is a css declaration
  props.css.indexOf(':') !== -1) {
    throw new Error("Strings are not allowed as css prop values, please wrap it in a css template literal from '@emotion/react' like this: css`" + props.css + "`");
  }

  const newProps = {};

  for (const _key in props) {
    if (hasOwn.call(props, _key)) {
      newProps[_key] = props[_key];
    }
  }

  newProps[typePropName] = type; // Runtime labeling is an opt-in feature because:
  // - It causes hydration warnings when using Safari and SSR
  // - It can degrade performance if there are a huge number of elements
  //
  // Even if the flag is set, we still don't compute the label if it has already
  // been determined by the Babel plugin.

  if (typeof globalThis !== 'undefined' && !!globalThis.EMOTION_RUNTIME_AUTO_LABEL && !!props.css && (typeof props.css !== 'object' || !('name' in props.css) || typeof props.css.name !== 'string' || props.css.name.indexOf('-') === -1)) {
    const label = getLabelFromStackTrace(new Error().stack);
    if (label) newProps[labelPropName] = label;
  }

  return newProps;
};

const Insertion = function Insertion(_ref) {
  const cache = _ref.cache,
      serialized = _ref.serialized,
      isStringTag = _ref.isStringTag;
  utils.registerStyles(cache, serialized, isStringTag);
  useInsertionEffectWithFallbacks.useInsertionEffectAlwaysWithSyncFallback(function () {
    return utils.insertStyles(cache, serialized, isStringTag);
  });

  return null;
};

const Emotion = /* #__PURE__ */withEmotionCache(function (props, cache, ref) {
  let cssProp = props.css; // so that using `css` from `emotion` and passing the result to the css prop works
  // not passing the registered cache to serializeStyles because it would
  // make certain babel optimisations not possible

  if (typeof cssProp === 'string' && cache.registered[cssProp] !== undefined) {
    cssProp = cache.registered[cssProp];
  }

  const WrappedComponent = props[typePropName];
  const registeredStyles = [cssProp];
  let className = '';

  if (typeof props.className === 'string') {
    className = utils.getRegisteredStyles(cache.registered, registeredStyles, props.className);
  } else if (props.className != null) {
    className = props.className + " ";
  }

  let serialized = serialize.serializeStyles(registeredStyles, undefined, React__namespace.useContext(ThemeContext));

  if (serialized.name.indexOf('-') === -1) {
    const labelFromStack = props[labelPropName];

    if (labelFromStack) {
      serialized = serialize.serializeStyles([serialized, 'label:' + labelFromStack + ';']);
    }
  }

  className += cache.key + "-" + serialized.name;
  const newProps = {};

  for (const _key2 in props) {
    if (hasOwn.call(props, _key2) && _key2 !== 'css' && _key2 !== typePropName && (_key2 !== labelPropName)) {
      newProps[_key2] = props[_key2];
    }
  }

  newProps.className = className;

  if (ref) {
    newProps.ref = ref;
  }

  return /*#__PURE__*/React__namespace.createElement(React__namespace.Fragment, null, /*#__PURE__*/React__namespace.createElement(Insertion, {
    cache: cache,
    serialized: serialized,
    isStringTag: typeof WrappedComponent === 'string'
  }), /*#__PURE__*/React__namespace.createElement(WrappedComponent, newProps));
});

{
  Emotion.displayName = 'EmotionCssPropInternal';
}

const Emotion$1 = Emotion;

exports.CacheProvider = CacheProvider;
exports.Emotion = Emotion$1;
exports.ThemeContext = ThemeContext;
exports.ThemeProvider = ThemeProvider;
exports.__unsafe_useEmotionCache = __unsafe_useEmotionCache;
exports.createEmotionProps = createEmotionProps;
exports.hasOwn = hasOwn;
exports.useTheme = useTheme;
exports.withEmotionCache = withEmotionCache;
exports.withTheme = withTheme;

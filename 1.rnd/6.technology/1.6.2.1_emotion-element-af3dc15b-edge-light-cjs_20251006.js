'use strict';

const React = require('react');
const createCache = require('@emotion/cache');
const _extends = require('@babel/runtime/helpers/extends');
const weakMemoize = require('@emotion/weak-memoize');
const _isolatedHnrs_dist_emotionReact_isolatedHnrs = require('../_isolated-hnrs/dist/emotion-react-_isolated-hnrs.edge-light.cjs.js');
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

const isDevelopment = false;

const EmotionCacheContext = /* #__PURE__ */React__namespace.createContext( // we're doing this to avoid preconstruct's dead code elimination in this one case
// because this module is primarily intended for the browser and node
// but it's also required in react native and similar environments sometimes
// and we could have a special build just for that
// but this is much easier and the native packages
// might use a different theme context in the future anyway
typeof HTMLElement !== 'undefined' ? /* #__PURE__ */createCache__default["default"]({
  key: 'css'
}) : null);

const CacheProvider = EmotionCacheContext.Provider;
const __unsafe_useEmotionCache = function useEmotionCache() {
  return React.useContext(EmotionCacheContext);
};

exports.withEmotionCache = function withEmotionCache(func) {
  return /*#__PURE__*/React.forwardRef(function (props, ref) {
    // the cache will never be null in the browser
    const cache = React.useContext(EmotionCacheContext);
    return func(props, cache, ref);
  });
};

{
  exports.withEmotionCache = function withEmotionCache(func) {
    return function (props) {
      let cache = React.useContext(EmotionCacheContext);

      if (cache === null) {
        // yes, we're potentially creating this on every render
        // it doesn't actually matter though since it's only on the server
        // so there will only every be a single render
        // that could change in the future because of suspense and etc. but for now,
        // this works and i don't want to optimise for a future thing that we aren't sure about
        cache = createCache__default["default"]({
          key: 'css'
        });
        return /*#__PURE__*/React__namespace.createElement(EmotionCacheContext.Provider, {
          value: cache
        }, func(props, cache));
      } else {
        return func(props, cache);
      }
    };
  };
}

const ThemeContext = /* #__PURE__ */React__namespace.createContext({});

const useTheme = function useTheme() {
  return React__namespace.useContext(ThemeContext);
};

const getTheme = function getTheme(outerTheme, theme) {
  if (typeof theme === 'function') {
    const mergedTheme = theme(outerTheme);

    return mergedTheme;
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

const typePropName = '__EMOTION_TYPE_PLEASE_DO_NOT_USE__';
const createEmotionProps = function createEmotionProps(type, props) {

  const newProps = {};

  for (const _key in props) {
    if (hasOwn.call(props, _key)) {
      newProps[_key] = props[_key];
    }
  }

  newProps[typePropName] = type; // Runtime labeling is an opt-in feature because:

  return newProps;
};

const Insertion = function Insertion(_ref) {
  const cache = _ref.cache,
      serialized = _ref.serialized,
      isStringTag = _ref.isStringTag;
  utils.registerStyles(cache, serialized, isStringTag);
  const rules = useInsertionEffectWithFallbacks.useInsertionEffectAlwaysWithSyncFallback(function () {
    return utils.insertStyles(cache, serialized, isStringTag);
  });

  if (rules !== undefined) {
    let _ref2;

    let serializedNames = serialized.name;
    let next = serialized.next;

    while (next !== undefined) {
      serializedNames += ' ' + next.name;
      next = next.next;
    }

    return /*#__PURE__*/React__namespace.createElement("style", (_ref2 = {}, _ref2["data-emotion"] = cache.key + " " + serializedNames, _ref2.dangerouslySetInnerHTML = {
      __html: rules
    }, _ref2.nonce = cache.sheet.nonce, _ref2));
  }

  return null;
};

const Emotion = /* #__PURE__ */exports.withEmotionCache(function (props, cache, ref) {
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

  const serialized = serialize.serializeStyles(registeredStyles, undefined, React__namespace.useContext(ThemeContext));

  className += cache.key + "-" + serialized.name;
  const newProps = {};

  for (const _key2 in props) {
    if (hasOwn.call(props, _key2) && _key2 !== 'css' && _key2 !== typePropName && (!isDevelopment )) {
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

const Emotion$1 = Emotion;

exports.CacheProvider = CacheProvider;
exports.Emotion = Emotion$1;
exports.ThemeContext = ThemeContext;
exports.ThemeProvider = ThemeProvider;
exports.__unsafe_useEmotionCache = __unsafe_useEmotionCache;
exports.createEmotionProps = createEmotionProps;
exports.hasOwn = hasOwn;
exports.isDevelopment = isDevelopment;
exports.useTheme = useTheme;
exports.withTheme = withTheme;

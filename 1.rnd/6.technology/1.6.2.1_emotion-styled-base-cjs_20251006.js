'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const _extends = require('@babel/runtime/helpers/extends');
const react = require('@emotion/react');
const serialize = require('@emotion/serialize');
const useInsertionEffectWithFallbacks = require('@emotion/use-insertion-effect-with-fallbacks');
const utils = require('@emotion/utils');
const React = require('react');
const isPropValid = require('@emotion/is-prop-valid');

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
const isPropValid__default = /*#__PURE__*/_interopDefault(isPropValid);

const isBrowser = typeof document !== 'undefined';

const isDevelopment = false;

const testOmitPropsOnStringTag = isPropValid__default["default"];

const testOmitPropsOnComponent = function testOmitPropsOnComponent(key) {
  return key !== 'theme';
};

const getDefaultShouldForwardProp = function getDefaultShouldForwardProp(tag) {
  return typeof tag === 'string' && // 96 is one less than the char code
  // for "a" so this is checking that
  // it's a lowercase character
  tag.charCodeAt(0) > 96 ? testOmitPropsOnStringTag : testOmitPropsOnComponent;
};
const composeShouldForwardProps = function composeShouldForwardProps(tag, options, isReal) {
  let shouldForwardProp;

  if (options) {
    const optionsShouldForwardProp = options.shouldForwardProp;
    shouldForwardProp = tag.__emotion_forwardProp && optionsShouldForwardProp ? function (propName) {
      return tag.__emotion_forwardProp(propName) && optionsShouldForwardProp(propName);
    } : optionsShouldForwardProp;
  }

  if (typeof shouldForwardProp !== 'function' && isReal) {
    shouldForwardProp = tag.__emotion_forwardProp;
  }

  return shouldForwardProp;
};

const Insertion = function Insertion(_ref) {
  const cache = _ref.cache,
      serialized = _ref.serialized,
      isStringTag = _ref.isStringTag;
  utils.registerStyles(cache, serialized, isStringTag);
  const rules = useInsertionEffectWithFallbacks.useInsertionEffectAlwaysWithSyncFallback(function () {
    return utils.insertStyles(cache, serialized, isStringTag);
  });

  if (!isBrowser && rules !== undefined) {
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

const createStyled = function createStyled(tag, options) {

  const isReal = tag.__emotion_real === tag;
  const baseTag = isReal && tag.__emotion_base || tag;
  let identifierName;
  let targetClassName;

  if (options !== undefined) {
    identifierName = options.label;
    targetClassName = options.target;
  }

  const shouldForwardProp = composeShouldForwardProps(tag, options, isReal);
  const defaultShouldForwardProp = shouldForwardProp || getDefaultShouldForwardProp(baseTag);
  const shouldUseAs = !defaultShouldForwardProp('as');
  return function () {
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    const styles = isReal && tag.__emotion_styles !== undefined ? tag.__emotion_styles.slice(0) : [];

    if (identifierName !== undefined) {
      styles.push("label:" + identifierName + ";");
    }

    if (args[0] == null || args[0].raw === undefined) {
      // eslint-disable-next-line prefer-spread
      styles.push.apply(styles, args);
    } else {
      const templateStringsArr = args[0];

      styles.push(templateStringsArr[0]);
      const len = args.length;
      let i = 1;

      for (; i < len; i++) {

        styles.push(args[i], templateStringsArr[i]);
      }
    }

    const Styled = react.withEmotionCache(function (props, cache, ref) {
      const FinalTag = shouldUseAs && props.as || baseTag;
      let className = '';
      const classInterpolations = [];
      let mergedProps = props;

      if (props.theme == null) {
        mergedProps = {};

        for (const key in props) {
          mergedProps[key] = props[key];
        }

        mergedProps.theme = React__namespace.useContext(react.ThemeContext);
      }

      if (typeof props.className === 'string') {
        className = utils.getRegisteredStyles(cache.registered, classInterpolations, props.className);
      } else if (props.className != null) {
        className = props.className + " ";
      }

      const serialized = serialize.serializeStyles(styles.concat(classInterpolations), cache.registered, mergedProps);
      className += cache.key + "-" + serialized.name;

      if (targetClassName !== undefined) {
        className += " " + targetClassName;
      }

      const finalShouldForwardProp = shouldUseAs && shouldForwardProp === undefined ? getDefaultShouldForwardProp(FinalTag) : defaultShouldForwardProp;
      const newProps = {};

      for (const _key in props) {
        if (shouldUseAs && _key === 'as') continue;

        if (finalShouldForwardProp(_key)) {
          newProps[_key] = props[_key];
        }
      }

      newProps.className = className;

      if (ref) {
        newProps.ref = ref;
      }

      return /*#__PURE__*/React__namespace.createElement(React__namespace.Fragment, null, /*#__PURE__*/React__namespace.createElement(Insertion, {
        cache: cache,
        serialized: serialized,
        isStringTag: typeof FinalTag === 'string'
      }), /*#__PURE__*/React__namespace.createElement(FinalTag, newProps));
    });
    Styled.displayName = identifierName !== undefined ? identifierName : "Styled(" + (typeof baseTag === 'string' ? baseTag : baseTag.displayName || baseTag.name || 'Component') + ")";
    Styled.defaultProps = tag.defaultProps;
    Styled.__emotion_real = Styled;
    Styled.__emotion_base = baseTag;
    Styled.__emotion_styles = styles;
    Styled.__emotion_forwardProp = shouldForwardProp;
    Object.defineProperty(Styled, 'toString', {
      value: function value() {
        if (targetClassName === undefined && isDevelopment) {
          return 'NO_COMPONENT_SELECTOR';
        }

        return "." + targetClassName;
      }
    });

    Styled.withComponent = function (nextTag, nextOptions) {
      const newStyled = createStyled(nextTag, _extends({}, options, nextOptions, {
        shouldForwardProp: composeShouldForwardProps(Styled, nextOptions, true)
      }));
      return newStyled.apply(void 0, styles);
    };

    return Styled;
  };
};

exports["default"] = createStyled;

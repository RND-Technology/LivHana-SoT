'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const React = require('react');

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

const isBrowser = typeof document !== 'undefined';

const syncFallback = function syncFallback(create) {
  return create();
};

const useInsertionEffect = React__namespace['useInsertion' + 'Effect'] ? React__namespace['useInsertion' + 'Effect'] : false;
const useInsertionEffectAlwaysWithSyncFallback = !isBrowser ? syncFallback : useInsertionEffect || syncFallback;
const useInsertionEffectWithLayoutFallback = useInsertionEffect || React__namespace.useLayoutEffect;

exports.useInsertionEffectAlwaysWithSyncFallback = useInsertionEffectAlwaysWithSyncFallback;
exports.useInsertionEffectWithLayoutFallback = useInsertionEffectWithLayoutFallback;

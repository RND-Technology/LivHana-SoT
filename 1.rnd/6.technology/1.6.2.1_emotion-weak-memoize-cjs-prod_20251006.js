'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const weakMemoize = function weakMemoize(func) {
  const cache = new WeakMap();
  return function (arg) {
    if (cache.has(arg)) {
      // Use non-null assertion because we just checked that the cache `has` it
      // This allows us to remove `undefined` from the return value
      return cache.get(arg);
    }

    const ret = func(arg);
    cache.set(arg, ret);
    return ret;
  };
};

exports["default"] = weakMemoize;

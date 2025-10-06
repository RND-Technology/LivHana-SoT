'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function memoize(fn) {
  const cache = Object.create(null);
  return function (arg) {
    if (cache[arg] === undefined) cache[arg] = fn(arg);
    return cache[arg];
  };
}

exports["default"] = memoize;

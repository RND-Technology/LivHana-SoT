"use strict";

exports.__esModule = true;
exports.forceReflow = void 0;

const forceReflow = function forceReflow(node) {
  return node.scrollTop;
};

exports.forceReflow = forceReflow;
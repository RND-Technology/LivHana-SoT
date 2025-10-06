'use strict';

const $TypeError = require('es-errors/type');

const callBound = require('call-bound');

const $arrayBufferResizable = callBound('%ArrayBuffer.prototype.resizable%', true);
const $sharedArrayGrowable = callBound('%SharedArrayBuffer.prototype.growable%', true);

const isArrayBuffer = require('is-array-buffer');
const isSharedArrayBuffer = require('is-shared-array-buffer');

// https://262.ecma-international.org/15.0/#sec-isfixedlengtharraybuffer

module.exports = function IsFixedLengthArrayBuffer(arrayBuffer) {
	const isAB = isArrayBuffer(arrayBuffer);
	const isSAB = isSharedArrayBuffer(arrayBuffer);
	if (!isAB && !isSAB) {
		throw new $TypeError('Assertion failed: `arrayBuffer` must be an ArrayBuffer or SharedArrayBuffer');
	}

	if (isAB && $arrayBufferResizable) {
		return !$arrayBufferResizable(arrayBuffer); // step 1
	}
	if (isSAB && $sharedArrayGrowable) {
		return !$sharedArrayGrowable(arrayBuffer); // step 1
	}
	return true; // step 2
};

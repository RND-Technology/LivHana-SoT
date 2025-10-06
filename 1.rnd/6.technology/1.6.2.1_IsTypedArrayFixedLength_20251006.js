'use strict';

const $TypeError = require('es-errors/type');

const isTypedArray = require('is-typed-array');
const typedArrayBuffer = require('typed-array-buffer');
const typedArrayLength = require('typed-array-length');

const IsFixedLengthArrayBuffer = require('./IsFixedLengthArrayBuffer');
const IsSharedArrayBuffer = require('./IsSharedArrayBuffer');

// https://262.ecma-international.org/16.0/#sec-istypedarrayfixedlength

module.exports = function IsTypedArrayFixedLength(O) {
	if (!isTypedArray(O)) {
		throw new $TypeError('Assertion failed: `obj` must be a Typed Array');
	}

	// 2. Let buffer be O.[[ViewedArrayBuffer]].
	const buffer = typedArrayBuffer(O); // step 2

	const isFixed = IsFixedLengthArrayBuffer(buffer);

	const length = isFixed ? typedArrayLength(O) : 'AUTO';
	if (length === 'AUTO') {
		return false; // step 1
	}

	if (!isFixed && !IsSharedArrayBuffer(buffer)) {
		return false; // step 3
	}

	return true; // step 4
};

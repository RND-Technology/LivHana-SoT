'use strict';

const $RangeError = require('es-errors/range');
const $TypeError = require('es-errors/type');

const ToIndex = require('./ToIndex');

const isTypedArray = require('is-typed-array');
const typedArrayLength = require('typed-array-length');

// https://262.ecma-international.org/8.0/#sec-validateatomicaccess

module.exports = function ValidateAtomicAccess(typedArray, requestIndex) {
	if (!isTypedArray(typedArray)) {
		throw new $TypeError('Assertion failed: `typedArray` must be a TypedArray'); // step 1
	}

	const accessIndex = ToIndex(requestIndex); // step 2

	const length = typedArrayLength(typedArray); // step 3

	/*
	// this assertion can never be reached
	if (!(accessIndex >= 0)) {
		throw new $TypeError('Assertion failed: accessIndex >= 0'); // step 4
	}
	*/

	if (accessIndex >= length) {
		throw new $RangeError('index out of range'); // step 5
	}

	return accessIndex; // step 6
};

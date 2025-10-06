'use strict';

const $TypeError = require('es-errors/type');

const GetValueFromBuffer = require('./GetValueFromBuffer');
const IsValidIntegerIndex = require('./IsValidIntegerIndex');
const TypedArrayElementSize = require('./TypedArrayElementSize');
const TypedArrayElementType = require('./TypedArrayElementType');

const isTypedArray = require('is-typed-array');
const typedArrayBuffer = require('typed-array-buffer');
const typedArrayByteOffset = require('typed-array-byte-offset');

// https://262.ecma-international.org/15.0/#sec-typedarraygetelement

module.exports = function TypedArrayGetElement(O, index) {
	if (!isTypedArray(O)) {
		throw new $TypeError('Assertion failed: `O` must be a TypedArray instance');
	}
	if (typeof index !== 'number') {
		throw new $TypeError('Assertion failed: `index` must be a Number');
	}

	if (!IsValidIntegerIndex(O, index)) {
		return undefined; // step 1
	}

	const offset = typedArrayByteOffset(O); // step 2

	const elementSize = TypedArrayElementSize(O); // step 3

	const byteIndexInBuffer = (index * elementSize) + offset; // step 4

	const elementType = TypedArrayElementType(O); // step 5

	return GetValueFromBuffer(typedArrayBuffer(O), byteIndexInBuffer, elementType, true, 'UNORDERED'); // step 6
};

'use strict';

const $TypeError = require('es-errors/type');

const IsFixedLengthArrayBuffer = require('./IsFixedLengthArrayBuffer');
const IsTypedArrayOutOfBounds = require('./IsTypedArrayOutOfBounds');
const TypedArrayElementSize = require('./TypedArrayElementSize');
const TypedArrayLength = require('./TypedArrayLength');

const isTypedArrayWithBufferWitnessRecord = require('../helpers/records/typed-array-with-buffer-witness-record');

const typedArrayByffer = require('typed-array-buffer');
const typedArrayByteLength = require('typed-array-byte-length');

// https://262.ecma-international.org/15.0/#sec-typedarraybytelength

module.exports = function TypedArrayByteLength(taRecord) {
	if (!isTypedArrayWithBufferWitnessRecord(taRecord)) {
		throw new $TypeError('Assertion failed: `taRecord` must be a TypedArray With Buffer Witness Record');
	}

	if (IsTypedArrayOutOfBounds(taRecord)) {
		return 0; // step 1
	}
	const length = TypedArrayLength(taRecord); // step 2

	if (length === 0) {
		return 0; // step 3
	}

	const O = taRecord['[[Object]]']; // step 4

	const isFixed = IsFixedLengthArrayBuffer(typedArrayByffer(O));

	const byteLength = isFixed ? typedArrayByteLength(O) : 'AUTO';
	if (byteLength !== 'AUTO') {
		return byteLength; // step 5
	}

	const elementSize = TypedArrayElementSize(O); // step 6

	return length * elementSize; // step 7
};

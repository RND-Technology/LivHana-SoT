'use strict';

const $TypeError = require('es-errors/type');

const floor = require('./floor');
const IsFixedLengthArrayBuffer = require('./IsFixedLengthArrayBuffer');
const IsTypedArrayOutOfBounds = require('./IsTypedArrayOutOfBounds');
const TypedArrayElementSize = require('./TypedArrayElementSize');

const isTypedArrayWithBufferWitnessRecord = require('../helpers/records/typed-array-with-buffer-witness-record');

const typedArrayBuffer = require('typed-array-buffer');
const typedArrayByteOffset = require('typed-array-byte-offset');
const typedArrayLength = require('typed-array-length');

// https://www.ecma-international.org/ecma-262/15.0/#sec-typedarraylength

module.exports = function TypedArrayLength(taRecord) {
	if (!isTypedArrayWithBufferWitnessRecord(taRecord)) {
		throw new $TypeError('Assertion failed: `taRecord` must be a TypedArray With Buffer Witness Record');
	}

	if (IsTypedArrayOutOfBounds(taRecord)) {
		throw new $TypeError('Assertion failed: `taRecord` is out of bounds'); // step 1
	}

	const O = taRecord['[[Object]]']; // step 2

	const isFixed = IsFixedLengthArrayBuffer(typedArrayBuffer(O));

	const length = isFixed ? typedArrayLength(O) : 'AUTO';
	if (length !== 'AUTO') {
		return length; // step 3
	}

	if (isFixed) {
		throw new $TypeError('Assertion failed: array buffer is not fixed length'); // step 4
	}

	const byteOffset = typedArrayByteOffset(O); // step 5

	const elementSize = TypedArrayElementSize(O); // step 6

	const byteLength = taRecord['[[CachedBufferByteLength]]']; // step 7

	if (byteLength === 'DETACHED') {
		throw new $TypeError('Assertion failed: typed array is detached'); // step 8
	}

	return floor((byteLength - byteOffset) / elementSize); // step 9
};

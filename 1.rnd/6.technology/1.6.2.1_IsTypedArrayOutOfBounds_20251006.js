'use strict';

const $TypeError = require('es-errors/type');

const IsDetachedBuffer = require('./IsDetachedBuffer');
const IsFixedLengthArrayBuffer = require('./IsFixedLengthArrayBuffer');
const TypedArrayElementSize = require('./TypedArrayElementSize');

const isTypedArrayWithBufferWitnessRecord = require('../helpers/records/typed-array-with-buffer-witness-record');

const typedArrayBuffer = require('typed-array-buffer');
const typedArrayByteOffset = require('typed-array-byte-offset');
const typedArrayLength = require('typed-array-length');

// https://262.ecma-international.org/15.0/#sec-istypedarrayoutofbounds

module.exports = function IsTypedArrayOutOfBounds(taRecord) {
	if (!isTypedArrayWithBufferWitnessRecord(taRecord)) {
		throw new $TypeError('Assertion failed: `taRecord` must be a TypedArray With Buffer Witness Record');
	}

	const O = taRecord['[[Object]]']; // step 1

	const bufferByteLength = taRecord['[[CachedBufferByteLength]]']; // step 2

	if (IsDetachedBuffer(typedArrayBuffer(O)) && bufferByteLength !== 'DETACHED') {
		throw new $TypeError('Assertion failed: typed array is detached only if the byte length is ~DETACHED~'); // step 3
	}

	if (bufferByteLength === 'DETACHED') {
		return true; // step 4
	}

	const byteOffsetStart = typedArrayByteOffset(O); // step 5

	const isFixed = IsFixedLengthArrayBuffer(typedArrayBuffer(O));

	let byteOffsetEnd;
	const length = isFixed ? typedArrayLength(O) : 'AUTO';
	// TODO: probably use package for array length
	// seems to apply when TA is backed by a resizable/growable AB
	if (length === 'AUTO') { // step 6
		byteOffsetEnd = bufferByteLength; // step 6.a
	} else {
		const elementSize = TypedArrayElementSize(O); // step 7.a

		byteOffsetEnd = byteOffsetStart + (length * elementSize); // step 7.b
	}

	if (byteOffsetStart > bufferByteLength || byteOffsetEnd > bufferByteLength) {
		return true; // step 8
	}

	// 9. NOTE: 0-length TypedArrays are not considered out-of-bounds.

	return false; // step 10
};

'use strict';

const $TypeError = require('es-errors/type');

const IsValidIntegerIndex = require('./IsValidIntegerIndex');
const SetValueInBuffer = require('./SetValueInBuffer');
const ToBigInt = require('./ToBigInt');
const ToNumber = require('./ToNumber');
const TypedArrayElementSize = require('./TypedArrayElementSize');
const TypedArrayElementType = require('./TypedArrayElementType');

const typedArrayBuffer = require('typed-array-buffer');
const typedArrayByteOffset = require('typed-array-byte-offset');
const whichTypedArray = require('which-typed-array');

// http://www.ecma-international.org/ecma-262/15.0/#sec-typedarraysetelement

module.exports = function TypedArraySetElement(O, index, value) {
	const which = whichTypedArray(O);
	if (!which) {
		throw new $TypeError('Assertion failed: `O` must be a Typed Array');
	}
	if (typeof index !== 'number') {
		throw new $TypeError('Assertion failed: `index` must be a Number');
	}

	const contentType = which === 'BigInt64Array' || which === 'BigUint64Array' ? 'BIGINT' : 'NUMBER';

	const numValue = contentType === 'BIGINT' ? ToBigInt(value) : ToNumber(value); // steps 1 - 2

	if (IsValidIntegerIndex(O, index)) { // step 3
		const offset = typedArrayByteOffset(O); // step 3.a

		const elementSize = TypedArrayElementSize(O); // step 3.b

		const byteIndexInBuffer = (index * elementSize) + offset; // step 3.c

		const elementType = TypedArrayElementType(O); // step 3.d

		SetValueInBuffer(typedArrayBuffer(O), byteIndexInBuffer, elementType, numValue, true, 'UNORDERED'); // step 3.e
	}
};

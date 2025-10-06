'use strict';

const $SyntaxError = require('es-errors/syntax');
const $TypeError = require('es-errors/type');

const IsDetachedBuffer = require('./IsDetachedBuffer');
const IsInteger = require('./IsInteger');
const SetValueInBuffer = require('./SetValueInBuffer');
const ToNumber = require('./ToNumber');

const isNegativeZero = require('math-intrinsics/isNegativeZero');
const typedArrayBuffer = require('typed-array-buffer');
const typedArrayByteOffset = require('typed-array-byte-offset');
const typedArrayLength = require('typed-array-length');
const whichTypedArray = require('which-typed-array');

const tableTAO = require('./tables/typed-array-objects');

// https://262.ecma-international.org/6.0/#sec-integerindexedelementset

module.exports = function IntegerIndexedElementSet(O, index, value) {
	if (typeof index !== 'number') {
		throw new $TypeError('`index` must be a Number'); // step 1
	}
	const arrayTypeName = whichTypedArray(O); // step 12
	if (!arrayTypeName) {
		throw new $TypeError('`O` must be a TypedArray'); // step 2
	}
	if (arrayTypeName === 'BigInt64Array' || arrayTypeName === 'BigUint64Array') {
		throw new $SyntaxError('BigInt64Array and BigUint64Array do not exist until ES2020'); // step 2
	}

	const numValue = ToNumber(value); // step 3

	const buffer = typedArrayBuffer(O); // step 5

	if (IsDetachedBuffer(buffer)) {
		throw new $TypeError('`O` has a detached buffer'); // step 6
	}

	if (!IsInteger(index) || isNegativeZero(index)) {
		return false; // steps 7 - 8
	}

	const length = typedArrayLength(O); // step 9

	if (index < 0 || index >= length) {
		return false; // step 10
	}

	const offset = typedArrayByteOffset(O); // step 11

	const elementType = tableTAO.name['$' + arrayTypeName]; // step 15

	const elementSize = tableTAO.size['$' + elementType]; // step 13

	const indexedPosition = (index * elementSize) + offset; // step 14

	SetValueInBuffer(buffer, indexedPosition, elementType, numValue); // step 16

	return true; // step 17
};

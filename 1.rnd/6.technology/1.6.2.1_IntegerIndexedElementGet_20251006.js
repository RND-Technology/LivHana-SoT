'use strict';

const $SyntaxError = require('es-errors/syntax');
const $TypeError = require('es-errors/type');
const isNegativeZero = require('math-intrinsics/isNegativeZero');

const GetValueFromBuffer = require('./GetValueFromBuffer');
const IsDetachedBuffer = require('./IsDetachedBuffer');
const IsInteger = require('./IsInteger');

const typedArrayLength = require('typed-array-length');
const typedArrayBuffer = require('typed-array-buffer');
const typedArrayByteOffset = require('typed-array-byte-offset');
const whichTypedArray = require('which-typed-array');

const tableTAO = require('./tables/typed-array-objects');

// https://262.ecma-international.org/6.0/#sec-integerindexedelementget

module.exports = function IntegerIndexedElementGet(O, index) {
	if (typeof index !== 'number') {
		throw new $TypeError('`index` must be a Number'); // step 1
	}
	const arrayTypeName = whichTypedArray(O); // step 10
	if (!arrayTypeName) {
		throw new $TypeError('`O` must be a TypedArray'); // step 2
	}
	if (arrayTypeName === 'BigInt64Array' || arrayTypeName === 'BigUint64Array') {
		throw new $SyntaxError('BigInt64Array and BigUint64Array do not exist until ES2020');
	}

	const buffer = typedArrayBuffer(O); // step 3

	if (IsDetachedBuffer(buffer)) {
		throw new $TypeError('`O` has a detached buffer'); // step 4
	}

	if (!IsInteger(index) || isNegativeZero(index)) {
		return void undefined; // steps 5 - 6
	}

	const length = typedArrayLength(O); // step 7

	if (index < 0 || index >= length) {
		return void undefined; // step 8
	}

	const offset = typedArrayByteOffset(O); // step 9

	const elementType = tableTAO.name['$' + arrayTypeName]; // step 13

	const elementSize = tableTAO.size['$' + elementType]; // step 11

	const indexedPosition = (index * elementSize) + offset; // step 12

	return GetValueFromBuffer(buffer, indexedPosition, elementType); // step 14
};

'use strict';

const $TypeError = require('es-errors/type');

const IsBigIntElementType = require('./IsBigIntElementType');
const IsUnclampedIntegerElementType = require('./IsUnclampedIntegerElementType');
const ValidateTypedArray = require('./ValidateTypedArray');

const whichTypedArray = require('which-typed-array');

// https://262.ecma-international.org/12.0/#sec-validateintegertypedarray

const tableTAO = require('./tables/typed-array-objects');

module.exports = function ValidateIntegerTypedArray(typedArray) {
	const waitable = arguments.length > 1 ? arguments[1] : false; // step 1

	if (typeof waitable !== 'boolean') {
		throw new $TypeError('Assertion failed: `waitable` must be a Boolean');
	}

	const buffer = ValidateTypedArray(typedArray); // step 2

	const typeName = whichTypedArray(typedArray); // step 3

	const type = tableTAO.name['$' + typeName]; // step 4

	if (waitable) { // step 5
		if (typeName !== 'Int32Array' && typeName !== 'BigInt64Array') {
			throw new $TypeError('Assertion failed: `typedArray` must be an Int32Array or BigInt64Array when `waitable` is true'); // step 5.a
		}
	} else if (!IsUnclampedIntegerElementType(type) && !IsBigIntElementType(type)) {
		throw new $TypeError('Assertion failed: `typedArray` must be an integer TypedArray'); // step 6.a
	}

	return buffer; // step 7
};

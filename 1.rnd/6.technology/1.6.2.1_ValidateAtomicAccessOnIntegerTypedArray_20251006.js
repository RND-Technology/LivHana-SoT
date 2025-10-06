'use strict';

const $TypeError = require('es-errors/type');

const ValidateAtomicAccess = require('./ValidateAtomicAccess');
const ValidateIntegerTypedArray = require('./ValidateIntegerTypedArray');

// https://262.ecma-international.org/15.0/#sec-availablenamedtimezoneidentifiers

module.exports = function ValidateAtomicAccessOnIntegerTypedArray(typedArray, requestIndex) {
	const waitable = arguments.length > 2 ? arguments[2] : false; // step 1

	if (typeof waitable !== 'boolean') {
		throw new $TypeError('waitable must be a boolean');
	}

	const taRecord = ValidateIntegerTypedArray(typedArray, waitable); // step 2
	return ValidateAtomicAccess(taRecord, requestIndex); // step 3
};

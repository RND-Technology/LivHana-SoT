'use strict';

const $TypeError = require('es-errors/type');
const isInteger = require('math-intrinsics/isInteger');
const isObject = require('es-object-atoms/isObject');

const Call = require('./Call');
const Get = require('./Get');
const ToBoolean = require('./ToBoolean');
const IsCallable = require('./IsCallable');
const ToString = require('./ToString');

// https://262.ecma-international.org/14.0/#sec-findviapredicate

module.exports = function FindViaPredicate(O, len, direction, predicate, thisArg) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}
	if (!isInteger(len) || len < 0) {
		throw new $TypeError('Assertion failed: len must be a non-negative integer');
	}
	if (direction !== 'ascending' && direction !== 'descending') {
		throw new $TypeError('Assertion failed: direction must be "ascending" or "descending"');
	}

	if (!IsCallable(predicate)) {
		throw new $TypeError('predicate must be callable'); // step 1
	}

	for ( // steps 2-4
		let k = direction === 'ascending' ? 0 : len - 1;
		direction === 'ascending' ? k < len : k >= 0;
		k += 1
	) {
		const Pk = ToString(k); // step 4.a
		const kValue = Get(O, Pk); // step 4.c
		const testResult = Call(predicate, thisArg, [kValue, k, O]); // step 4.d
		if (ToBoolean(testResult)) {
			return { '[[Index]]': k, '[[Value]]': kValue }; // step 4.e
		}
	}
	return { '[[Index]]': -1, '[[Value]]': void undefined }; // step 5
};

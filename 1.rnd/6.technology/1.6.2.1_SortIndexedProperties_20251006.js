'use strict';

const $TypeError = require('es-errors/type');
const callBound = require('call-bound');
const isInteger = require('math-intrinsics/isInteger');
const isObject = require('es-object-atoms/isObject');

const Get = require('./Get');
const HasProperty = require('./HasProperty');
const ToString = require('./ToString');

const isAbstractClosure = require('../helpers/isAbstractClosure');

const $sort = callBound('Array.prototype.sort');

// https://262.ecma-international.org/14.0/#sec-sortindexedproperties

module.exports = function SortIndexedProperties(obj, len, SortCompare, holes) {
	if (!isObject(obj)) {
		throw new $TypeError('Assertion failed: Type(obj) is not Object');
	}
	if (!isInteger(len) || len < 0) {
		throw new $TypeError('Assertion failed: `len` must be an integer >= 0');
	}
	if (!isAbstractClosure(SortCompare) || SortCompare.length !== 2) {
		throw new $TypeError('Assertion failed: `SortCompare` must be an abstract closure taking 2 arguments');
	}
	if (holes !== 'skip-holes' && holes !== 'read-through-holes') {
		throw new $TypeError('Assertion failed: `holes` must be either ~skip-holes~ or ~read-through-holes~');
	}

	const items = []; // step 1

	let k = 0; // step 2

	while (k < len) { // step 3
		const Pk = ToString(k);
		const kRead = holes === 'skip-holes' ? HasProperty(obj, Pk) : true; // step 3.b - 3.c
		if (kRead) { // step 3.d
			const kValue = Get(obj, Pk);
			items[items.length] = kValue;
		}
		k += 1; // step 3.e
	}

	$sort(items, SortCompare); // step 4

	return items; // step 5
};

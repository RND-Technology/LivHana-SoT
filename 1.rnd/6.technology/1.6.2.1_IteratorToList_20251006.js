'use strict';

const $TypeError = require('es-errors/type');

const IteratorStep = require('./IteratorStep');
const IteratorValue = require('./IteratorValue');

const isIteratorRecord = require('../helpers/records/iterator-record-2023');

// https://262.ecma-international.org/14.0/#sec-iteratortolist

module.exports = function IteratorToList(iteratorRecord) {
	if (!isIteratorRecord(iteratorRecord)) {
		throw new $TypeError('Assertion failed: `iteratorRecord` must be an Iterator Record'); // step 1
	}

	const values = []; // step 1
	let next = true; // step 2
	while (next) { // step 3
		next = IteratorStep(iteratorRecord); // step 3.a
		if (next) {
			const nextValue = IteratorValue(next); // step 3.b.i
			values[values.length] = nextValue; // step 3.b.ii
		}
	}
	return values; // step 4
};

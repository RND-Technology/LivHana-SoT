'use strict';

const GetIterator = require('./GetIterator');
const IteratorStep = require('./IteratorStep');
const IteratorValue = require('./IteratorValue');

// https://262.ecma-international.org/8.0/#sec-iterabletolist

module.exports = function IterableToList(items, method) {
	const iterator = GetIterator(items, method);
	const values = [];
	let next = true;
	while (next) {
		next = IteratorStep(iterator);
		if (next) {
			const nextValue = IteratorValue(next);
			values[values.length] = nextValue;
		}
	}
	return values;
};

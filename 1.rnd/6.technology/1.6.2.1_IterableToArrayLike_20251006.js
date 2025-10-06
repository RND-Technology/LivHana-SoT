'use strict';

const getIteratorMethod = require('../helpers/getIteratorMethod');
const AdvanceStringIndex = require('./AdvanceStringIndex');
const GetIterator = require('./GetIterator');
const GetMethod = require('./GetMethod');
const IteratorStep = require('./IteratorStep');
const IteratorValue = require('./IteratorValue');
const ToObject = require('./ToObject');
const ES = {
	AdvanceStringIndex: AdvanceStringIndex,
	GetMethod: GetMethod
};

// https://262.ecma-international.org/7.0/#sec-iterabletoarraylike

module.exports = function IterableToArrayLike(items) {
	const usingIterator = getIteratorMethod(ES, items);
	if (typeof usingIterator !== 'undefined') {
		const iterator = GetIterator(items, usingIterator);
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
	}

	return ToObject(items);
};

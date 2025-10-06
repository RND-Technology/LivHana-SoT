'use strict';

const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');
const inspect = require('object-inspect');

const Call = require('./Call');
const Get = require('./Get');
const GetIterator = require('./GetIterator');
const IsCallable = require('./IsCallable');
const IteratorClose = require('./IteratorClose');
const IteratorStep = require('./IteratorStep');
const IteratorValue = require('./IteratorValue');
const ThrowCompletion = require('./ThrowCompletion');

// https://262.ecma-international.org/10.0/#sec-add-entries-from-iterable

module.exports = function AddEntriesFromIterable(target, iterable, adder) {
	if (!IsCallable(adder)) {
		throw new $TypeError('Assertion failed: `adder` is not callable');
	}
	if (iterable == null) {
		throw new $TypeError('Assertion failed: `iterable` is present, and not nullish');
	}
	const iteratorRecord = GetIterator(iterable);
	while (true) { // eslint-disable-line no-constant-condition
		const next = IteratorStep(iteratorRecord);
		if (!next) {
			return target;
		}
		const nextItem = IteratorValue(next);
		if (!isObject(nextItem)) {
			const error = ThrowCompletion(new $TypeError('iterator next must return an Object, got ' + inspect(nextItem)));
			return IteratorClose(iteratorRecord, error);
		}
		try {
			const k = Get(nextItem, '0');
			const v = Get(nextItem, '1');
			Call(adder, target, [k, v]);
		} catch (e) {
			return IteratorClose(iteratorRecord, ThrowCompletion(e));
		}
	}
};

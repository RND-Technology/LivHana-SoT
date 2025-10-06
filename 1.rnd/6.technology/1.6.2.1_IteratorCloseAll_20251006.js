'use strict';

const $TypeError = require('es-errors/type');

const CompletionRecord = require('es-abstract/2024/CompletionRecord');
const IteratorClose = require('es-abstract/2024/IteratorClose');
const ThrowCompletion = require('es-abstract/2024/ThrowCompletion');

const IsArray = require('es-abstract/helpers/IsArray');
const every = require('es-abstract/helpers/every');

const isIteratorRecord = require('es-abstract/helpers/records/iterator-record');

// https://tc39.es/proposal-joint-iteration/#sec-closeall

module.exports = function IteratorCloseAll(iters, completion) {
	if (!IsArray(iters) || !every(iters, isIteratorRecord)) {
		throw new $TypeError('Assertion failed: `iters` must be a List of IteratorRecords');
	}
	if (!(completion instanceof CompletionRecord)) {
		throw new $TypeError('Assertion failed: `completion` must be a Completion Record');
	}

	for (let i = iters.length - 1; i >= 0; i -= 1) { // step 1
		try {
			IteratorClose(iters[i], completion); // step 1.a
		} catch (e) {
			// eslint-disable-next-line no-param-reassign
			completion = ThrowCompletion(e); // step 1.a
		}
	}

	return completion['?'](); // step 2
};

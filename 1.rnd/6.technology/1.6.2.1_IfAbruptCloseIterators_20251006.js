'use strict';

const $TypeError = require('es-errors/type');

const CompletionRecord = require('es-abstract/2024/CompletionRecord');
const IteratorCloseAll = require('./IteratorCloseAll');

// https://tc39.es/proposal-joint-iteration/#sec-ifabruptcloseiterators

module.exports = function IfAbruptCloseIterators(value, iteratorRecords) {
	if (!(value instanceof CompletionRecord)) {
		throw new $TypeError('Assertion failed: `value` must be a Completion Record'); // step 1
	}
	if (value.type() === 'throw') {
		return IteratorCloseAll(iteratorRecords, value); // step 2
	}

	return value['!'](); // step
};

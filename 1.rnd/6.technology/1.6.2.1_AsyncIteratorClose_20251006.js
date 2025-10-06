'use strict';

const GetIntrinsic = require('get-intrinsic');

const $SyntaxError = require('es-errors/syntax');
const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');
const $Promise = GetIntrinsic('%Promise%', true);

const Call = require('./Call');
const CompletionRecord = require('./CompletionRecord');
const GetMethod = require('./GetMethod');

const isIteratorRecord = require('../helpers/records/iterator-record-2023');

const callBound = require('call-bound');

const $then = callBound('Promise.prototype.then', true);

// https://262.ecma-international.org/9.0/#sec-asynciteratorclose

module.exports = function AsyncIteratorClose(iteratorRecord, completion) {
	if (!isIteratorRecord(iteratorRecord)) {
		throw new $TypeError('Assertion failed: `iteratorRecord` must be an Iterator Record'); // step 1
	}

	if (!(completion instanceof CompletionRecord)) {
		throw new $TypeError('Assertion failed: completion is not a Completion Record instance'); // step 2
	}

	if (!$then) {
		throw new $SyntaxError('This environment does not support Promises.');
	}

	const iterator = iteratorRecord['[[Iterator]]']; // step 3

	return new $Promise(function (resolve) {
		const ret = GetMethod(iterator, 'return'); // step 4

		if (typeof ret === 'undefined') {
			resolve(completion); // step 5
		} else {
			resolve($then(
				new $Promise(function (resolve2) {
					// process.exit(42);
					resolve2(Call(ret, iterator, [])); // step 6
				}),
				function (innerResult) {
					if (!isObject(innerResult)) {
						throw new $TypeError('`innerResult` must be an Object'); // step 10
					}
					return completion;
				},
				function (e) {
					if (completion.type() === 'throw') {
						completion['?'](); // step 8
					} else {
						throw e; // step 9
					}
				}
			));
		}
	});
};

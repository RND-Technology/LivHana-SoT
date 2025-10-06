'use strict';

const GetIntrinsic = require('get-intrinsic');

const $SyntaxError = require('es-errors/syntax');
const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');
const $Promise = GetIntrinsic('%Promise%', true);

const Call = require('./Call');
const CreateIterResultObject = require('./CreateIterResultObject');
const Get = require('./Get');
const GetMethod = require('./GetMethod');
const IteratorComplete = require('./IteratorComplete');
const IteratorNext = require('./IteratorNext');
const IteratorValue = require('./IteratorValue');
const ObjectCreate = require('./ObjectCreate');
const PromiseResolve = require('./PromiseResolve');

const isIteratorRecord = require('../helpers/records/iterator-record-2023');

const SLOT = require('internal-slot');

const callBound = require('call-bound');

const $then = callBound('Promise.prototype.then', true);

const AsyncFromSyncIteratorContinuation = function AsyncFromSyncIteratorContinuation(result) {
	if (!isObject(result)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}

	if (arguments.length > 1) {
		throw new $TypeError('although AsyncFromSyncIteratorContinuation should take a second argument, it is not used in this implementation');
	}

	if (!$Promise) {
		throw new $SyntaxError('This environment does not support Promises.');
	}

	return new $Promise(function (resolve) {
		const done = IteratorComplete(result); // step 2
		const value = IteratorValue(result); // step 4
		const valueWrapper = PromiseResolve($Promise, value); // step 6

		// eslint-disable-next-line no-shadow
		const onFulfilled = function (value) { // steps 8-9
			return CreateIterResultObject(value, done); // step 8.a
		};
		resolve($then(valueWrapper, onFulfilled)); // step 11
	}); // step 12
};

const $AsyncFromSyncIteratorPrototype = GetIntrinsic('%AsyncFromSyncIteratorPrototype%', true) || {
	next: function next(value) {
		if (!$Promise) {
			throw new $SyntaxError('This environment does not support Promises.');
		}

		const O = this; // step 1

		SLOT.assert(O, '[[SyncIteratorRecord]]'); // step 2

		const argsLength = arguments.length;

		return new $Promise(function (resolve) { // step 3
			const syncIteratorRecord = SLOT.get(O, '[[SyncIteratorRecord]]'); // step 4
			let result;
			if (argsLength > 0) {
				result = IteratorNext(syncIteratorRecord['[[Iterator]]'], value); // step 5.a
			} else { // step 6
				result = IteratorNext(syncIteratorRecord['[[Iterator]]']);// step 6.a
			}
			resolve(AsyncFromSyncIteratorContinuation(result)); // step 8
		});
	},
	'return': function () {
		if (!$Promise) {
			throw new $SyntaxError('This environment does not support Promises.');
		}

		const O = this; // step 1

		SLOT.assert(O, '[[SyncIteratorRecord]]'); // step 2

		const valueIsPresent = arguments.length > 0;
		const value = valueIsPresent ? arguments[0] : void undefined;

		return new $Promise(function (resolve, reject) { // step 3
			const syncIterator = SLOT.get(O, '[[SyncIteratorRecord]]')['[[Iterator]]']; // step 4
			const iteratorReturn = GetMethod(syncIterator, 'return'); // step 5

			if (typeof iteratorReturn === 'undefined') { // step 7
				const iterResult = CreateIterResultObject(value, true); // step 7.a
				Call(resolve, undefined, [iterResult]); // step 7.b
				return;
			}
			let result;
			if (valueIsPresent) { // step 8
				result = Call(iteratorReturn, syncIterator, [value]); // step 8.a
			} else { // step 9
				result = Call(iteratorReturn, syncIterator); // step 9.a
			}
			if (!isObject(result)) { // step 11
				Call(reject, undefined, [new $TypeError('Iterator `return` method returned a non-object value.')]); // step 11.a
				return;
			}

			resolve(AsyncFromSyncIteratorContinuation(result)); // step 12
		});
	},
	'throw': function () {
		if (!$Promise) {
			throw new $SyntaxError('This environment does not support Promises.');
		}

		const O = this; // step 1

		SLOT.assert(O, '[[SyncIteratorRecord]]'); // step 2

		const valueIsPresent = arguments.length > 0;
		const value = valueIsPresent ? arguments[0] : void undefined;

		return new $Promise(function (resolve, reject) { // step 3
			const syncIterator = SLOT.get(O, '[[SyncIteratorRecord]]')['[[Iterator]]']; // step 4

			const throwMethod = GetMethod(syncIterator, 'throw'); // step 5

			if (typeof throwMethod === 'undefined') { // step 7
				Call(reject, undefined, [value]); // step 7.a
				return;
			}

			let result;
			if (valueIsPresent) { // step 8
				result = Call(throwMethod, syncIterator, [value]); // step 8.a
			} else { // step 9
				result = Call(throwMethod, syncIterator); // step 9.a
			}
			if (!isObject(result)) { // step 11
				Call(reject, undefined, [new $TypeError('Iterator `throw` method returned a non-object value.')]); // step 11.a
				return;
			}

			resolve(AsyncFromSyncIteratorContinuation(result/* , promiseCapability */)); // step 12
		});
	}
};

// https://262.ecma-international.org/9.0/#sec-createasyncfromsynciterator

module.exports = function CreateAsyncFromSyncIterator(syncIteratorRecord) {
	if (!isIteratorRecord(syncIteratorRecord)) {
		throw new $TypeError('Assertion failed: `syncIteratorRecord` is not an Iterator Record');
	}

	// var asyncIterator = ObjectCreate(%AsyncFromSyncIteratorPrototype%, « [[SyncIteratorRecord]] »); // step 1
	const asyncIterator = ObjectCreate($AsyncFromSyncIteratorPrototype);

	SLOT.set(asyncIterator, '[[SyncIteratorRecord]]', syncIteratorRecord); // step 2

	const nextMethod = Get(asyncIterator, 'next'); // step 3

	return { // steps 3-4
		'[[Iterator]]': asyncIterator,
		'[[NextMethod]]': nextMethod,
		'[[Done]]': false
	};
};

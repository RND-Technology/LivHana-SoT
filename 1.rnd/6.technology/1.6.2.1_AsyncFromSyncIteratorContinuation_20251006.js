'use strict';

const GetIntrinsic = require('get-intrinsic');

const $SyntaxError = require('es-errors/syntax');
const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');
const $Promise = GetIntrinsic('%Promise%', true);

const callBound = require('call-bound');

const CreateIterResultObject = require('./CreateIterResultObject');
const IteratorComplete = require('./IteratorComplete');
const IteratorValue = require('./IteratorValue');
const PromiseResolve = require('./PromiseResolve');

const $then = callBound('Promise.prototype.then', true);

// https://262.ecma-international.org/10.0/#sec-asyncfromsynciteratorcontinuation

module.exports = function AsyncFromSyncIteratorContinuation(result) {
	if (!isObject(result)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}

	if (arguments.length > 1) {
		throw new $SyntaxError('although AsyncFromSyncIteratorContinuation should take a second argument, it is not used in this implementation');
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

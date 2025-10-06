'use strict';

const $RangeError = require('es-errors/range');
const $TypeError = require('es-errors/type');

const Get = require('./Get');
const IsCallable = require('./IsCallable');
const ToIntegerOrInfinity = require('./ToIntegerOrInfinity');
const ToNumber = require('./ToNumber');

const isNaN = require('..//helpers/isNaN');
const isObject = require('es-object-atoms/isObject');

const callBind = require('call-bind');
const isSet = require('is-set');
const stopIterationIterator = require('stop-iteration-iterator');

// https://262.ecma-international.org/16.0/#sec-getsetrecord

module.exports = function GetSetRecord(obj) {
	if (!isObject(obj)) {
		throw new $TypeError('obj is not an Object'); // step 1
	}

	const rawSize = Get(obj, 'size'); // step 2

	const numSize = ToNumber(rawSize); // step 3

	//  4. NOTE: If rawSize is undefined, then numSize will be NaN.
	if (isNaN(numSize)) {
		throw new $TypeError('`size` is not a non-NaN Number'); // step 5
	}

	const intSize = ToIntegerOrInfinity(numSize); // step 6

	if (intSize < 0) {
		throw new $RangeError('set size must be non-negative'); // step 7
	}

	const has = Get(obj, 'has'); // step 8

	if (!IsCallable(has)) {
		throw new $TypeError('has is not a function'); // step 9
	}

	let keys = Get(obj, 'keys'); // step 10
	if (!IsCallable(keys)) {
		throw new $TypeError('keys is not a function'); // step 11
	}
	/* globals StopIteration: false */
	if (isSet(obj) && typeof StopIteration === 'object') {
		const boundKeys = callBind(keys);
		keys = function keys() { // eslint-disable-line no-shadow
			return stopIterationIterator(boundKeys(this)); // eslint-disable-line no-invalid-this
		};
	}

	return {
		'[[SetObject]]': obj,
		'[[Size]]': intSize,
		'[[Has]]': has,
		'[[Keys]]': keys
	}; // step 12
};

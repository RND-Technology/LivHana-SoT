'use strict';

const callBound = require('call-bound');

const $TypeError = require('es-errors/type');

const $charAt = callBound('String.prototype.charAt');

const isString = require('is-string');
const isNegativeZero = require('math-intrinsics/isNegativeZero');
const unbox = require('unbox-primitive');

const CanonicalNumericIndexString = require('./CanonicalNumericIndexString');
const IsInteger = require('./IsInteger');
const isPropertyKey = require('../helpers/isPropertyKey');

// https://262.ecma-international.org/6.0/#sec-stringgetindexproperty

module.exports = function StringGetIndexProperty(S, P) {
	if (typeof S === 'string' || !isString(S)) {
		throw new $TypeError('Assertion failed: `S` must be a boxed String Object');
	}
	if (!isPropertyKey(P)) {
		throw new $TypeError('Assertion failed: `P` must be a Property Key');
	}

	if (typeof P !== 'string') {
		return void undefined;
	}

	const index = CanonicalNumericIndexString(P);
	if (typeof index === 'undefined' || !IsInteger(index) || isNegativeZero(index)) {
		return void undefined;
	}

	const str = unbox(S);
	const len = str.length;
	if (index < 0 || len <= index) {
		return void undefined;
	}

	const resultStr = $charAt(str, index);

	return {
		'[[Configurable]]': false,
		'[[Enumerable]]': true,
		'[[Value]]': resultStr,
		'[[Writable]]': false
	};
};

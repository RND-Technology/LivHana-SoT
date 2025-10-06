'use strict';

const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');

const callBound = require('call-bound');
const $charAt = callBound('String.prototype.charAt');
const $stringToString = callBound('String.prototype.toString');

const CanonicalNumericIndexString = require('./CanonicalNumericIndexString');
const IsInteger = require('./IsInteger');

const isPropertyKey = require('../helpers/isPropertyKey');

const isNegativeZero = require('math-intrinsics/isNegativeZero');

// https://262.ecma-international.org/8.0/#sec-stringgetownproperty

module.exports = function StringGetOwnProperty(S, P) {
	let str;
	if (isObject(S)) {
		try {
			str = $stringToString(S);
		} catch (e) { /**/ }
	}
	if (typeof str !== 'string') {
		throw new $TypeError('Assertion failed: `S` must be a boxed string object');
	}
	if (!isPropertyKey(P)) {
		throw new $TypeError('Assertion failed: P is not a Property Key');
	}
	if (typeof P !== 'string') {
		return void undefined;
	}
	const index = CanonicalNumericIndexString(P);
	const len = str.length;
	if (typeof index === 'undefined' || !IsInteger(index) || isNegativeZero(index) || index < 0 || len <= index) {
		return void undefined;
	}
	const resultStr = $charAt(S, index);
	return {
		'[[Configurable]]': false,
		'[[Enumerable]]': true,
		'[[Value]]': resultStr,
		'[[Writable]]': false
	};
};

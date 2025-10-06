'use strict';

const callBound = require('call-bound');

const $TypeError = require('es-errors/type');
const isInteger = require('math-intrinsics/isInteger');

const $slice = callBound('String.prototype.slice');

// https://262.ecma-international.org/12.0/#sec-stringindexof

module.exports = function StringIndexOf(string, searchValue, fromIndex) {
	if (typeof string !== 'string') {
		throw new $TypeError('Assertion failed: `string` must be a String');
	}
	if (typeof searchValue !== 'string') {
		throw new $TypeError('Assertion failed: `searchValue` must be a String');
	}
	if (!isInteger(fromIndex) || fromIndex < 0) {
		throw new $TypeError('Assertion failed: `fromIndex` must be a non-negative integer');
	}

	const len = string.length;
	if (searchValue === '' && fromIndex <= len) {
		return fromIndex;
	}

	const searchLen = searchValue.length;
	for (let i = fromIndex; i <= (len - searchLen); i += 1) {
		const candidate = $slice(string, i, i + searchLen);
		if (candidate === searchValue) {
			return i;
		}
	}
	return -1;
};

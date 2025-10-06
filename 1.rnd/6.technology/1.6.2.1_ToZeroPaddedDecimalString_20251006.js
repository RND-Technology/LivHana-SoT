'use strict';

const GetIntrinsic = require('get-intrinsic');

const $String = GetIntrinsic('%String%');
const $RangeError = require('es-errors/range');
const isInteger = require('math-intrinsics/isInteger');

const StringPad = require('./StringPad');

// https://262.ecma-international.org/13.0/#sec-tozeropaddeddecimalstring

module.exports = function ToZeroPaddedDecimalString(n, minLength) {
	if (!isInteger(n) || n < 0) {
		throw new $RangeError('Assertion failed: `q` must be a non-negative integer');
	}
	const S = $String(n);
	return StringPad(S, minLength, '0', 'start');
};

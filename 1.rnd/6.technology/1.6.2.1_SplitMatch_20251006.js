'use strict';

const callBound = require('call-bound');

const $TypeError = require('es-errors/type');
const isInteger = require('math-intrinsics/isInteger');

const $charAt = callBound('String.prototype.charAt');

// https://262.ecma-international.org/6.0/#sec-splitmatch

module.exports = function SplitMatch(S, q, R) {
	if (typeof S !== 'string') {
		throw new $TypeError('Assertion failed: `S` must be a String');
	}
	if (!isInteger(q)) {
		throw new $TypeError('Assertion failed: `q` must be an integer');
	}
	if (typeof R !== 'string') {
		throw new $TypeError('Assertion failed: `R` must be a String');
	}
	const r = R.length;
	const s = S.length;
	if (q + r > s) {
		return false;
	}

	for (let i = 0; i < r; i += 1) {
		if ($charAt(S, q + i) !== $charAt(R, i)) {
			return false;
		}
	}

	return q + r;
};

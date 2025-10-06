'use strict';

const MAX_SAFE_INTEGER = require('math-intrinsics/constants/maxSafeInteger');

const ToInteger = require('./ToInteger');

// https://262.ecma-international.org/6.0/#sec-tolength

module.exports = function ToLength(argument) {
	const len = ToInteger(argument);
	if (len <= 0) { return 0; } // includes converting -0 to +0
	if (len > MAX_SAFE_INTEGER) { return MAX_SAFE_INTEGER; }
	return len;
};

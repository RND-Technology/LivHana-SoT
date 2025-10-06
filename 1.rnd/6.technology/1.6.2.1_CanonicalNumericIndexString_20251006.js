'use strict';

const $TypeError = require('es-errors/type');

const SameValue = require('./SameValue');
const ToNumber = require('./ToNumber');
const ToString = require('./ToString');

// https://262.ecma-international.org/6.0/#sec-canonicalnumericindexstring

module.exports = function CanonicalNumericIndexString(argument) {
	if (typeof argument !== 'string') {
		throw new $TypeError('Assertion failed: `argument` must be a String');
	}
	if (argument === '-0') { return -0; }
	const n = ToNumber(argument);
	if (SameValue(ToString(n), argument)) { return n; }
	return void 0;
};

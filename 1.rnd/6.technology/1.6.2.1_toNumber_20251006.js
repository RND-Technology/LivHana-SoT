'use strict';

const ToPrimitive = require('./ToPrimitive');

const callBound = require('call-bound');

const $replace = callBound('String.prototype.replace');

const safeRegexTester = require('safe-regex-test');

const isNonDecimal = safeRegexTester(/^0[ob]|^[+-]0x/);

const $Number = Number;

// http://262.ecma-international.org/5.1/#sec-9.3

module.exports = function ToNumber(value) {
	const prim = ToPrimitive(value, $Number);
	if (typeof prim !== 'string') {
		return $Number(prim);
	}

	const trimmed = $replace(
		prim,
		// eslint-disable-next-line no-control-regex
		/^[ \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u0085]+|[ \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u0085]+$/g,
		''
	);
	if (isNonDecimal(trimmed)) {
		return NaN;
	}

	return +trimmed;
};

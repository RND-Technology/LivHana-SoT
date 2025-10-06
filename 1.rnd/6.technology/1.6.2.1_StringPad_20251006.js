'use strict';

const $TypeError = require('es-errors/type');

const callBound = require('call-bound');

const ToLength = require('./ToLength');
const ToString = require('./ToString');

const $strSlice = callBound('String.prototype.slice');

// https://262.ecma-international.org/11.0/#sec-stringpad

module.exports = function StringPad(O, maxLength, fillString, placement) {
	if (placement !== 'start' && placement !== 'end') {
		throw new $TypeError('Assertion failed: `placement` must be "start" or "end"');
	}
	const S = ToString(O);
	const intMaxLength = ToLength(maxLength);
	const stringLength = S.length;
	if (intMaxLength <= stringLength) {
		return S;
	}
	const filler = typeof fillString === 'undefined' ? ' ' : ToString(fillString);
	if (filler === '') {
		return S;
	}
	const fillLen = intMaxLength - stringLength;

	// the String value consisting of repeated concatenations of filler truncated to length fillLen.
	let truncatedStringFiller = '';
	while (truncatedStringFiller.length < fillLen) {
		truncatedStringFiller += filler;
	}
	truncatedStringFiller = $strSlice(truncatedStringFiller, 0, fillLen);

	if (placement === 'start') {
		return truncatedStringFiller + S;
	}
	return S + truncatedStringFiller;
};

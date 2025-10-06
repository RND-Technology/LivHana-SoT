'use strict';

const callBound = require('call-bound');
const $TypeError = require('es-errors/type');
const isInteger = require('math-intrinsics/isInteger');

const StringToCodePoints = require('./StringToCodePoints');

const $indexOf = callBound('String.prototype.indexOf');

// https://262.ecma-international.org/13.0/#sec-getstringindex

module.exports = function GetStringIndex(S, e) {
	if (typeof S !== 'string') {
		throw new $TypeError('Assertion failed: `S` must be a String');
	}
	if (!isInteger(e) || e < 0) {
		throw new $TypeError('Assertion failed: `e` must be a non-negative integer');
	}

	if (S === '') {
		return 0;
	}
	const codepoints = StringToCodePoints(S);
	const eUTF = e >= codepoints.length ? S.length : $indexOf(S, codepoints[e]);
	return eUTF;
};

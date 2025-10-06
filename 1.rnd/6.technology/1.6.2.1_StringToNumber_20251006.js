'use strict';

const GetIntrinsic = require('get-intrinsic');

const $RegExp = GetIntrinsic('%RegExp%');
const $TypeError = require('es-errors/type');
const $parseInteger = GetIntrinsic('%parseInt%');

const callBound = require('call-bound');
const regexTester = require('safe-regex-test');

const $strSlice = callBound('String.prototype.slice');
const isBinary = regexTester(/^0b[01]+$/i);
const isOctal = regexTester(/^0o[0-7]+$/i);
const isInvalidHexLiteral = regexTester(/^[-+]0x[0-9a-f]+$/i);
const nonWS = ['\u0085', '\u200b', '\ufffe'].join('');
const nonWSregex = new $RegExp('[' + nonWS + ']', 'g');
const hasNonWS = regexTester(nonWSregex);

const $trim = require('string.prototype.trim');

// https://262.ecma-international.org/13.0/#sec-stringtonumber

module.exports = function StringToNumber(argument) {
	if (typeof argument !== 'string') {
		throw new $TypeError('Assertion failed: `argument` is not a String');
	}
	if (isBinary(argument)) {
		return +$parseInteger($strSlice(argument, 2), 2);
	}
	if (isOctal(argument)) {
		return +$parseInteger($strSlice(argument, 2), 8);
	}
	if (hasNonWS(argument) || isInvalidHexLiteral(argument)) {
		return NaN;
	}
	const trimmed = $trim(argument);
	if (trimmed !== argument) {
		return StringToNumber(trimmed);
	}
	return +argument;
};

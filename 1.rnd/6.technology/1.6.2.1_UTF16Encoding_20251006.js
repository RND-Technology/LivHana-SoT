'use strict';

const GetIntrinsic = require('get-intrinsic');

const $TypeError = require('es-errors/type');
const $fromCharCode = GetIntrinsic('%String.fromCharCode%');

const floor = require('./floor');
const modulo = require('./modulo');

const isCodePoint = require('../helpers/isCodePoint');

// https://262.ecma-international.org/7.0/#sec-utf16encoding

module.exports = function UTF16Encoding(cp) {
	if (!isCodePoint(cp)) {
		throw new $TypeError('Assertion failed: `cp` must be >= 0 and <= 0x10FFFF');
	}
	if (cp <= 65535) {
		return $fromCharCode(cp);
	}
	const cu1 = $fromCharCode(floor((cp - 65536) / 1024) + 0xD800);
	const cu2 = $fromCharCode(modulo(cp - 65536, 1024) + 0xDC00);
	return cu1 + cu2;
};

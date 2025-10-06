'use strict';

const GetIntrinsic = require('get-intrinsic');

const $TypeError = require('es-errors/type');
const $fromCharCode = GetIntrinsic('%String.fromCharCode%');

const isLeadingSurrogate = require('../helpers/isLeadingSurrogate');
const isTrailingSurrogate = require('../helpers/isTrailingSurrogate');

// https://262.ecma-international.org/11.0/#sec-utf16decodesurrogatepair

module.exports = function UTF16DecodeSurrogatePair(lead, trail) {
	if (!isLeadingSurrogate(lead) || !isTrailingSurrogate(trail)) {
		throw new $TypeError('Assertion failed: `lead` must be a leading surrogate char code, and `trail` must be a trailing surrogate char code');
	}
	// var cp = (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
	return $fromCharCode(lead) + $fromCharCode(trail);
};

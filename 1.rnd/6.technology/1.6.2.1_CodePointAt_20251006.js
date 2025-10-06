'use strict';

const $TypeError = require('es-errors/type');
const callBound = require('call-bound');
const isLeadingSurrogate = require('../helpers/isLeadingSurrogate');
const isTrailingSurrogate = require('../helpers/isTrailingSurrogate');

const UTF16DecodeSurrogatePair = require('./UTF16DecodeSurrogatePair');

const $charAt = callBound('String.prototype.charAt');
const $charCodeAt = callBound('String.prototype.charCodeAt');

// https://262.ecma-international.org/11.0/#sec-codepointat

module.exports = function CodePointAt(string, position) {
	if (typeof string !== 'string') {
		throw new $TypeError('Assertion failed: `string` must be a String');
	}
	const size = string.length;
	if (position < 0 || position >= size) {
		throw new $TypeError('Assertion failed: `position` must be >= 0, and < the length of `string`');
	}
	const first = $charCodeAt(string, position);
	const cp = $charAt(string, position);
	const firstIsLeading = isLeadingSurrogate(first);
	const firstIsTrailing = isTrailingSurrogate(first);
	if (!firstIsLeading && !firstIsTrailing) {
		return {
			'[[CodePoint]]': cp,
			'[[CodeUnitCount]]': 1,
			'[[IsUnpairedSurrogate]]': false
		};
	}
	if (firstIsTrailing || (position + 1 === size)) {
		return {
			'[[CodePoint]]': cp,
			'[[CodeUnitCount]]': 1,
			'[[IsUnpairedSurrogate]]': true
		};
	}
	const second = $charCodeAt(string, position + 1);
	if (!isTrailingSurrogate(second)) {
		return {
			'[[CodePoint]]': cp,
			'[[CodeUnitCount]]': 1,
			'[[IsUnpairedSurrogate]]': true
		};
	}

	return {
		'[[CodePoint]]': UTF16DecodeSurrogatePair(first, second),
		'[[CodeUnitCount]]': 2,
		'[[IsUnpairedSurrogate]]': false
	};
};

'use strict';

const $TypeError = require('es-errors/type');

const callBound = require('call-bound');
const forEach = require('../helpers/forEach');

const $charCodeAt = callBound('String.prototype.charCodeAt');
const $numberToString = callBound('Number.prototype.toString');
const $toLowerCase = callBound('String.prototype.toLowerCase');
const $strSlice = callBound('String.prototype.slice');
const $strSplit = callBound('String.prototype.split');

// https://262.ecma-international.org/6.0/#sec-quotejsonstring

const escapes = {
	'\u0008': 'b',
	'\u000C': 'f',
	'\u000A': 'n',
	'\u000D': 'r',
	'\u0009': 't'
};

module.exports = function QuoteJSONString(value) {
	if (typeof value !== 'string') {
		throw new $TypeError('Assertion failed: `value` must be a String');
	}
	let product = '"';
	if (value) {
		forEach($strSplit(value, ''), function (C) {
			if (C === '"' || C === '\\') {
				product += '\u005C' + C;
			} else if (C === '\u0008' || C === '\u000C' || C === '\u000A' || C === '\u000D' || C === '\u0009') {
				const abbrev = escapes[C];
				product += '\u005C' + abbrev;
			} else {
				const cCharCode = $charCodeAt(C, 0);
				if (cCharCode < 0x20) {
					product += '\u005Cu' + $toLowerCase($strSlice('0000' + $numberToString(cCharCode, 16), -4));
				} else {
					product += C;
				}
			}
		});
	}
	product += '"';
	return product;
};

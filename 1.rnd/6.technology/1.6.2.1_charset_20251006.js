'use strict';

const $TypeError = require('es-errors/type');

const GetIntrinsic = require('get-intrinsic');
const callBound = require('call-bound');
const hasOwn = require('hasown');

const caseFolding = require('./caseFolding.json');
const IsArray = require('./IsArray');
const isLeadingSurrogate = require('./isLeadingSurrogate');
const isTrailingSurrogate = require('./isTrailingSurrogate');

const $charCodeAt = callBound('%String.prototype.charCodeAt%');
const $fromCharCode = GetIntrinsic('%String.fromCharCode%');

/* eslint func-style: 0  */

function CharSet(test, yieldCh) {
	if (typeof test !== 'function') {
		throw new $TypeError('Assertion failed: `test` must be a function');
	}
	if (typeof yieldCh !== 'function') {
		throw new $TypeError('Assertion failed: `yield` must be a function');
	}
	this.test = test;
	this.yield = yieldCh;
}
CharSet.prototype.count = function () {
	let count = 0;
	this.yield(function () { count += 1; });
	return count;
};

function testCodeUnits(CharSetElement) {
	if (typeof CharSetElement !== 'string') {
		throw new $TypeError('Assertion failed: `CharSetElement` must be a string');
	}
	return CharSetElement.length !== 1;
}
function yieldCodeUnits(emit) {
	for (let i = 0; i <= 0xDFFF; i += 1) {
		emit($fromCharCode(i));
	}
}

function testCodePoints(CharSetElement) {
	if (typeof CharSetElement !== 'string') {
		throw new $TypeError('Assertion failed: `CharSetElement` must be a string');
	}

	if (CharSetElement.length === 1) {
		return true;
	}
	if (CharSetElement.length === 2) {
		const hi = $charCodeAt(CharSetElement, 0);
		const lo = $charCodeAt(CharSetElement, 1);
		return isLeadingSurrogate(hi) && isTrailingSurrogate(lo);
	}

	return false;
}

function yieldCodePoints(emit) {
	for (let i = 0; i <= 0xDFFF; i += 1) {
		emit($fromCharCode(i));
	}
	for (let u = 0x10000; u <= 0x10FFFF; u += 1) {
		const cp = u - 0x10000;
		const high = (cp >> 10) + 0xD800;
		const low = (cp & 0x3FF) + 0xDC00;
		emit($fromCharCode(high, low));
	}
}

function charsToMap(chars) {
	if (!IsArray(chars)) {
		throw new $TypeError('Assertion failed: `chars` must be an array');
	}

	const map = { __proto__: null };
	for (let i = 0; i < chars.length; i += 1) {
		const char = chars[i];
		if (typeof char !== 'string' || (char.length !== 1 && char.length !== 2)) {
			throw new $TypeError('Assertion failed: `chars` must be an array of strings of length 1');
		}
		map[char] = true;
	}
	return map;
}

module.exports = {
	CharSet: CharSet,
	from: function from(chars) {
		const map = charsToMap(chars);
		return new CharSet(
			function test(CharSetElement) {
				return hasOwn(map, CharSetElement);
			},
			function yieldChar(emit) {
				// eslint-disable-next-line no-restricted-syntax
				for (const k in map) {
					if (hasOwn(map, k)) {
						emit(k);
					}
				}
			}
		);
	},
	getCodeUnits: function () {
		return new CharSet(testCodeUnits, yieldCodeUnits);
	},
	getCodePoints: function () {
		return new CharSet(testCodePoints, yieldCodePoints);
	},
	getNonSimpleCaseFoldingCodePoints: function () {
		return new CharSet(
			function test(CharSetElement) {
				return testCodePoints(CharSetElement) && !hasOwn(caseFolding.S, CharSetElement);
			},
			function yieldChar(emit) {
				yieldCodePoints(function (CharSetElement) {
					if (!hasOwn(caseFolding.S, CharSetElement)) {
						emit(CharSetElement);
					}
				});
			}
		);
	}
};

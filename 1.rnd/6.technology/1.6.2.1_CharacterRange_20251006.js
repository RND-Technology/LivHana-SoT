'use strict';

const GetIntrinsic = require('get-intrinsic');
const callBound = require('call-bound');

const $fromCharCode = GetIntrinsic('%String.fromCharCode%');
const $TypeError = require('es-errors/type');
const $charCodeAt = callBound('String.prototype.charCodeAt');

const CharSet = require('../helpers/CharSet').CharSet;

module.exports = function CharacterRange(A, B) {
	let a;
	let b;

	if (A instanceof CharSet || B instanceof CharSet) {
		if (!(A instanceof CharSet) || !(B instanceof CharSet)) {
			throw new $TypeError('Assertion failed: CharSets A and B are not both CharSets');
		}

		A.yield(function (c) {
			if (typeof a !== 'undefined') {
				throw new $TypeError('Assertion failed: CharSet A has more than one character');
			}
			a = c;
		});
		B.yield(function (c) {
			if (typeof b !== 'undefined') {
				throw new $TypeError('Assertion failed: CharSet B has more than one character');
			}
			b = c;
		});
	} else {
		if (A.length !== 1 || B.length !== 1) {
			throw new $TypeError('Assertion failed: CharSets A and B contain exactly one character');
		}
		a = A[0];
		b = B[0];
	}

	const i = $charCodeAt(a, 0);
	const j = $charCodeAt(b, 0);

	if (!(i <= j)) {
		throw new $TypeError('Assertion failed: i is not <= j');
	}

	const arr = [];
	for (let k = i; k <= j; k += 1) {
		arr[arr.length] = $fromCharCode(k);
	}
	return arr;
};

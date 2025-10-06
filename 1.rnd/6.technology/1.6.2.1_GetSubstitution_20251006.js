
'use strict';

const GetIntrinsic = require('get-intrinsic');

const $TypeError = require('es-errors/type');
const $parseInt = GetIntrinsic('%parseInt%');

const inspect = require('object-inspect');
const isInteger = require('math-intrinsics/isInteger');
const regexTester = require('safe-regex-test');
const callBound = require('call-bound');
const every = require('../helpers/every');

const isDigit = regexTester(/^[0-9]$/);

const $charAt = callBound('String.prototype.charAt');
const $strSlice = callBound('String.prototype.slice');

const IsArray = require('./IsArray');

const isStringOrUndefined = require('../helpers/isStringOrUndefined');

// https://262.ecma-international.org/6.0/#sec-getsubstitution

// eslint-disable-next-line max-statements, max-lines-per-function
module.exports = function GetSubstitution(matched, str, position, captures, replacement) {
	if (typeof matched !== 'string') {
		throw new $TypeError('Assertion failed: `matched` must be a String');
	}
	const matchLength = matched.length;

	if (typeof str !== 'string') {
		throw new $TypeError('Assertion failed: `str` must be a String');
	}
	const stringLength = str.length;

	if (!isInteger(position) || position < 0 || position > stringLength) {
		throw new $TypeError('Assertion failed: `position` must be a nonnegative integer, and less than or equal to the length of `string`, got ' + inspect(position));
	}

	if (!IsArray(captures) || !every(captures, isStringOrUndefined)) {
		throw new $TypeError('Assertion failed: `captures` must be a List of Strings, got ' + inspect(captures));
	}

	if (typeof replacement !== 'string') {
		throw new $TypeError('Assertion failed: `replacement` must be a String');
	}

	const tailPos = position + matchLength;
	const m = captures.length;

	let result = '';
	for (let i = 0; i < replacement.length; i += 1) {
		// if this is a $, and it's not the end of the replacement
		const current = $charAt(replacement, i);
		const isLast = (i + 1) >= replacement.length;
		const nextIsLast = (i + 2) >= replacement.length;
		if (current === '$' && !isLast) {
			const next = $charAt(replacement, i + 1);
			if (next === '$') {
				result += '$';
				i += 1;
			} else if (next === '&') {
				result += matched;
				i += 1;
			} else if (next === '`') {
				result += position === 0 ? '' : $strSlice(str, 0, position - 1);
				i += 1;
			} else if (next === "'") {
				result += tailPos >= stringLength ? '' : $strSlice(str, tailPos);
				i += 1;
			} else {
				const nextNext = nextIsLast ? null : $charAt(replacement, i + 2);
				if (isDigit(next) && next !== '0' && (nextIsLast || !isDigit(nextNext))) {
					// $1 through $9, and not followed by a digit
					const n = $parseInt(next, 10);
					// if (n > m, impl-defined)
					result += n <= m && typeof captures[n - 1] === 'undefined' ? '' : captures[n - 1];
					i += 1;
				} else if (isDigit(next) && (nextIsLast || isDigit(nextNext))) {
					// $00 through $99
					const nn = next + nextNext;
					const nnI = $parseInt(nn, 10) - 1;
					// if nn === '00' or nn > m, impl-defined
					result += nn <= m && typeof captures[nnI] === 'undefined' ? '' : captures[nnI];
					i += 2;
				} else {
					result += '$';
				}
			}
		} else {
			// the final $, or else not a $
			result += $charAt(replacement, i);
		}
	}
	return result;
};

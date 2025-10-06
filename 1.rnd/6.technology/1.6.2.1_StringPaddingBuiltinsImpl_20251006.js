'use strict';

const $TypeError = require('es-errors/type');

const StringPad = require('./StringPad');
const ToLength = require('./ToLength');
const ToString = require('./ToString');

// https://262.ecma-international.org/15.0/#sec-stringpaddingbuiltinsimpl

module.exports = function StringPaddingBuiltinsImpl(O, maxLength, fillString, placement) {
	if (placement !== 'start' && placement !== 'end' && placement !== 'START' && placement !== 'END') {
		throw new $TypeError('Assertion failed: `placement` must be ~START~ or ~END~');
	}

	const S = ToString(O); // step 1

	const intMaxLength = ToLength(maxLength); // step 2

	const stringLength = S.length; // step 3

	if (intMaxLength <= stringLength) { return S; } // step 4

	const filler = typeof fillString === 'undefined' ? ' ' : ToString(fillString); // steps 5-6

	return StringPad(S, intMaxLength, filler, placement); // step 7
};

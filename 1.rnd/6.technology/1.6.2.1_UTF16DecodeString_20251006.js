'use strict';

const $TypeError = require('es-errors/type');

const CodePointAt = require('./CodePointAt');

// https://262.ecma-international.org/11.0/#sec-utf16decodestring

module.exports = function UTF16DecodeString(string) {
	if (typeof string !== 'string') {
		throw new $TypeError('Assertion failed: `string` must be a String');
	}
	const codePoints = [];
	const size = string.length;
	let position = 0;
	while (position < size) {
		const cp = CodePointAt(string, position);
		codePoints[codePoints.length] = cp['[[CodePoint]]'];
		position += cp['[[CodeUnitCount]]'];
	}
	return codePoints;
};

'use strict';

const $SyntaxError = require('es-errors/syntax');
const $TypeError = require('es-errors/type');
const isInteger = require('math-intrinsics/isInteger');
const whichTypedArray = require('which-typed-array');

// https://262.ecma-international.org/13.0/#sec-typedarrayelementsize

const tableTAO = require('./tables/typed-array-objects');

module.exports = function TypedArrayElementSize(O) {
	const type = whichTypedArray(O);
	if (!type) {
		throw new $TypeError('Assertion failed: `O` must be a TypedArray');
	}
	const size = tableTAO.size['$' + tableTAO.name['$' + type]];
	if (!isInteger(size) || size < 0) {
		throw new $SyntaxError('Assertion failed: Unknown TypedArray type `' + type + '`');
	}

	return size;
};

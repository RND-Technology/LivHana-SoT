'use strict';

const $SyntaxError = require('es-errors/syntax');
const $TypeError = require('es-errors/type');

const whichTypedArray = require('which-typed-array');

// https://262.ecma-international.org/13.0/#sec-typedarrayelementtype

const tableTAO = require('./tables/typed-array-objects');

module.exports = function TypedArrayElementType(O) {
	const type = whichTypedArray(O);
	if (!type) {
		throw new $TypeError('Assertion failed: `O` must be a TypedArray');
	}
	const result = tableTAO.name['$' + type];
	if (typeof result !== 'string') {
		throw new $SyntaxError('Assertion failed: Unknown TypedArray type `' + type + '`');
	}

	return result;
};

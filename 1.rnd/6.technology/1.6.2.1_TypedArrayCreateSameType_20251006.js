'use strict';

const $SyntaxError = require('es-errors/syntax');
const $TypeError = require('es-errors/type');

const whichTypedArray = require('which-typed-array');
const availableTypedArrays = require('available-typed-arrays')();

const IsArray = require('./IsArray');
const TypedArrayCreate = require('./TypedArrayCreate');

const getConstructor = require('../helpers/typedArrayConstructors');

// https://262.ecma-international.org/14.0/#sec-typedarray-create-same-type

module.exports = function TypedArrayCreateSameType(exemplar, argumentList) {
	if (availableTypedArrays.length === 0) {
		throw new $SyntaxError('Assertion failed: Typed Arrays are not supported in this environment');
	}

	const kind = whichTypedArray(exemplar);
	if (!kind) {
		throw new $TypeError('Assertion failed: exemplar must be a TypedArray'); // step 1
	}
	if (!IsArray(argumentList)) {
		throw new $TypeError('Assertion failed: `argumentList` must be a List'); // step 1
	}

	const constructor = getConstructor(kind); // step 2
	if (typeof constructor !== 'function') {
		throw new $SyntaxError('Assertion failed: `constructor` of `exemplar` (' + kind + ') must exist. Please report this!');
	}

	return TypedArrayCreate(constructor, argumentList); // steps 3 - 6
};

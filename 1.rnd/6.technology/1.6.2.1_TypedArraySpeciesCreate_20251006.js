'use strict';

const $SyntaxError = require('es-errors/syntax');
const $TypeError = require('es-errors/type');

const whichTypedArray = require('which-typed-array');
const availableTypedArrays = require('available-typed-arrays')();

const IsArray = require('./IsArray');
const SpeciesConstructor = require('./SpeciesConstructor');
const TypedArrayCreate = require('./TypedArrayCreate');

const getConstructor = require('../helpers/typedArrayConstructors');

// https://262.ecma-international.org/7.0/#typedarray-species-create

module.exports = function TypedArraySpeciesCreate(exemplar, argumentList) {
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

	const defaultConstructor = getConstructor(kind); // step 2
	if (typeof defaultConstructor !== 'function') {
		throw new $SyntaxError('Assertion failed: `constructor` of `exemplar` (' + kind + ') must exist. Please report this!');
	}
	const constructor = SpeciesConstructor(exemplar, defaultConstructor); // step 3

	return TypedArrayCreate(constructor, argumentList); // step 4
};

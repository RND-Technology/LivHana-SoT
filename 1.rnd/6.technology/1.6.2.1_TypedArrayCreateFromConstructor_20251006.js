'use strict';

const $SyntaxError = require('es-errors/syntax');
const $TypeError = require('es-errors/type');

const IsArray = require('./IsArray');
const IsConstructor = require('./IsConstructor');
const IsTypedArrayOutOfBounds = require('./IsTypedArrayOutOfBounds');
const TypedArrayLength = require('./TypedArrayLength');
const ValidateTypedArray = require('./ValidateTypedArray');

const availableTypedArrays = require('available-typed-arrays')();

// https://262.ecma-international.org/15.0/#typedarraycreatefromconstructor

module.exports = function TypedArrayCreateFromConstructor(constructor, argumentList) {
	if (!IsConstructor(constructor)) {
		throw new $TypeError('Assertion failed: `constructor` must be a constructor');
	}
	if (!IsArray(argumentList)) {
		throw new $TypeError('Assertion failed: `argumentList` must be a List');
	}
	if (availableTypedArrays.length === 0) {
		throw new $SyntaxError('Assertion failed: Typed Arrays are not supported in this environment');
	}

	// var newTypedArray = Construct(constructor, argumentList); // step 1
	let newTypedArray;
	if (argumentList.length === 0) {
		newTypedArray = new constructor();
	} else if (argumentList.length === 1) {
		newTypedArray = new constructor(argumentList[0]);
	} else if (argumentList.length === 2) {
		newTypedArray = new constructor(argumentList[0], argumentList[1]);
	} else {
		newTypedArray = new constructor(argumentList[0], argumentList[1], argumentList[2]);
	}

	const taRecord = ValidateTypedArray(newTypedArray, 'SEQ-CST'); // step 2

	if (argumentList.length === 1 && typeof argumentList[0] === 'number') { // step 3
		if (IsTypedArrayOutOfBounds(taRecord)) {
			throw new $TypeError('new Typed Array is out of bounds'); // step 3.a
		}
		const length = TypedArrayLength(taRecord); // step 3.b
		if (length < argumentList[0]) {
			throw new $TypeError('`argumentList[0]` must be <= `newTypedArray.length`'); // step 3.c
		}
	}

	return newTypedArray; // step 4
};

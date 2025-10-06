'use strict';

const $TypeError = require('es-errors/type');

const IsArray = require('./IsArray');
const IsInteger = require('./IsInteger');

const every = require('../helpers/every');
const regexTester = require('safe-regex-test');

const isChar = function isChar(c) {
	return typeof c === 'string' && c.length === 1;
};

const isWordCharacter = regexTester(/^[a-zA-Z0-9_]$/);

// https://262.ecma-international.org/6.0/#sec-runtime-semantics-iswordchar-abstract-operation

// note: prior to ES2023, this AO erroneously omitted the latter of its arguments.
module.exports = function IsWordChar(e, InputLength, Input) {
	if (!IsInteger(e)) {
		throw new $TypeError('Assertion failed: `e` must be an integer');
	}
	if (!IsInteger(InputLength)) {
		throw new $TypeError('Assertion failed: `InputLength` must be an integer');
	}
	if (!IsArray(Input) || !every(Input, isChar)) {
		throw new $TypeError('Assertion failed: `Input` must be a List of characters');
	}
	if (e === -1 || e === InputLength) {
		return false; // step 1
	}

	const c = Input[e]; // step 2

	return isWordCharacter(c); // steps 3-4
};

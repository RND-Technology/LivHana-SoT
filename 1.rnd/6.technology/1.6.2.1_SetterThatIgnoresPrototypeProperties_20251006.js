'use strict';

const $TypeError = require('es-errors/type');
const gOPD = require('gopd');

const isObject = require('../helpers/isObject');
const isPropertyKey = require('../helpers/isPropertyKey');

const CreateDataPropertyOrThrow = require('./CreateDataPropertyOrThrow');
const SameValue = require('./SameValue');
const Set = require('./Set');

// https://262.ecma-international.org/16.0/#sec-SetterThatIgnoresPrototypeProperties

module.exports = function SetterThatIgnoresPrototypeProperties(thisValue, home, p, v) {
	if (!isObject(home)) {
		throw new $TypeError('Assertion failed: `home` must be an object');
	}
	if (!isPropertyKey(p)) {
		throw new $TypeError('Assertion failed: `p` must be a Property Key');
	}

	if (!isObject(thisValue)) { // step 1
		throw new $TypeError('Assertion failed: `thisValue` must be an Object'); // step 1.a
	}

	if (SameValue(thisValue, home)) { // step 2
		throw new $TypeError('Throwing here emulates assignment to a non-writable data property on the `home` object in strict mode code'); // step 2.b
	}

	const desc = gOPD(thisValue, p); // step 3

	if (typeof desc === 'undefined') { // step 4
		CreateDataPropertyOrThrow(thisValue, p, v); // step 4.a
	} else { // step 5
		Set(thisValue, p, v, true); // step 5.a
	}
};

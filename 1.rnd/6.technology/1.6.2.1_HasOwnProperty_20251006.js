'use strict';

const $TypeError = require('es-errors/type');

const hasOwn = require('hasown');
const isObject = require('es-object-atoms/isObject');

const isPropertyKey = require('../helpers/isPropertyKey');

// https://262.ecma-international.org/6.0/#sec-hasownproperty

module.exports = function HasOwnProperty(O, P) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: `O` must be an Object');
	}
	if (!isPropertyKey(P)) {
		throw new $TypeError('Assertion failed: `P` must be a Property Key');
	}
	return hasOwn(O, P);
};

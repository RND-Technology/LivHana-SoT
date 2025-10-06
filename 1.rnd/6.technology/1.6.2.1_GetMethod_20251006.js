'use strict';

const $TypeError = require('es-errors/type');

const GetV = require('./GetV');
const IsCallable = require('./IsCallable');
const isPropertyKey = require('../helpers/isPropertyKey');

const inspect = require('object-inspect');

// https://262.ecma-international.org/6.0/#sec-getmethod

module.exports = function GetMethod(O, P) {
	// 7.3.9.1
	if (!isPropertyKey(P)) {
		throw new $TypeError('Assertion failed: P is not a Property Key');
	}

	// 7.3.9.2
	const func = GetV(O, P);

	// 7.3.9.4
	if (func == null) {
		return void 0;
	}

	// 7.3.9.5
	if (!IsCallable(func)) {
		throw new $TypeError(inspect(P) + ' is not a function: ' + inspect(func));
	}

	// 7.3.9.6
	return func;
};

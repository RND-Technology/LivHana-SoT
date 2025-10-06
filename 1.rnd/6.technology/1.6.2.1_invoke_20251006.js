'use strict';

const $TypeError = require('es-errors/type');

const Call = require('./Call');
const IsArray = require('./IsArray');
const GetV = require('./GetV');
const isPropertyKey = require('../helpers/isPropertyKey');

// https://262.ecma-international.org/6.0/#sec-invoke

module.exports = function Invoke(O, P) {
	if (!isPropertyKey(P)) {
		throw new $TypeError('Assertion failed: P must be a Property Key');
	}
	const argumentsList = arguments.length > 2 ? arguments[2] : [];
	if (!IsArray(argumentsList)) {
		throw new $TypeError('Assertion failed: optional `argumentsList`, if provided, must be a List');
	}
	const func = GetV(O, P);
	return Call(func, O, argumentsList);
};

'use strict';

const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');

const Get = require('./Get');
const IsCallable = require('./IsCallable');

// https://262.ecma-international.org/6.0/#sec-ordinaryhasinstance

module.exports = function OrdinaryHasInstance(C, O) {
	if (!IsCallable(C)) {
		return false;
	}
	if (!isObject(O)) {
		return false;
	}
	const P = Get(C, 'prototype');
	if (!isObject(P)) {
		throw new $TypeError('OrdinaryHasInstance called on an object with an invalid prototype property.');
	}
	return O instanceof C;
};

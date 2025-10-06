'use strict';

const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');

const Call = require('./Call');
const GetV = require('./GetV');
const IsCallable = require('./IsCallable');

// https://262.ecma-international.org/14.0/#sec-getiteratorfrommethod

module.exports = function GetIteratorFromMethod(obj, method) {
	if (!IsCallable(method)) {
		throw new $TypeError('method must be a function');
	}

	const iterator = Call(method, obj); // step 1
	if (!isObject(iterator)) {
		throw new $TypeError('iterator must return an object'); // step 2
	}

	const nextMethod = GetV(iterator, 'next'); // step 3
	return { // steps 4-5
		'[[Iterator]]': iterator,
		'[[NextMethod]]': nextMethod,
		'[[Done]]': false
	};
};

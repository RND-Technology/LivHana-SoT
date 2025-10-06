'use strict';

const $TypeError = require('es-errors/type');

const getIteratorMethod = require('../helpers/getIteratorMethod');
const AdvanceStringIndex = require('./AdvanceStringIndex');
const Call = require('./Call');
const GetMethod = require('./GetMethod');

const isObject = require('es-object-atoms/isObject');

const ES = {
	AdvanceStringIndex: AdvanceStringIndex,
	GetMethod: GetMethod
};

// https://262.ecma-international.org/6.0/#sec-getiterator

module.exports = function GetIterator(obj, method) {
	let actualMethod = method;
	if (arguments.length < 2) {
		actualMethod = getIteratorMethod(ES, obj);
	}
	const iterator = Call(actualMethod, obj);
	if (!isObject(iterator)) {
		throw new $TypeError('iterator must return an object');
	}

	return iterator;
};

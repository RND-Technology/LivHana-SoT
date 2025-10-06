'use strict';

const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');

const CreateDataProperty = require('./CreateDataProperty');

const isPropertyKey = require('../helpers/isPropertyKey');

// // https://262.ecma-international.org/6.0/#sec-createdatapropertyorthrow

module.exports = function CreateDataPropertyOrThrow(O, P, V) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}
	if (!isPropertyKey(P)) {
		throw new $TypeError('Assertion failed: P is not a Property Key');
	}
	const success = CreateDataProperty(O, P, V);
	if (!success) {
		throw new $TypeError('unable to create data property');
	}
	return success;
};

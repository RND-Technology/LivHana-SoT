'use strict';

const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');

const DefineOwnProperty = require('../helpers/DefineOwnProperty');

const FromPropertyDescriptor = require('./FromPropertyDescriptor');
const IsDataDescriptor = require('./IsDataDescriptor');
const isPropertyKey = require('../helpers/isPropertyKey');
const SameValue = require('./SameValue');

// https://262.ecma-international.org/6.0/#sec-createmethodproperty

module.exports = function CreateMethodProperty(O, P, V) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}

	if (!isPropertyKey(P)) {
		throw new $TypeError('Assertion failed: P is not a Property Key');
	}

	const newDesc = {
		'[[Configurable]]': true,
		'[[Enumerable]]': false,
		'[[Value]]': V,
		'[[Writable]]': true
	};
	return DefineOwnProperty(
		IsDataDescriptor,
		SameValue,
		FromPropertyDescriptor,
		O,
		P,
		newDesc
	);
};

'use strict';

const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');

const isPropertyDescriptor = require('../helpers/records/property-descriptor');
const DefineOwnProperty = require('../helpers/DefineOwnProperty');

const FromPropertyDescriptor = require('./FromPropertyDescriptor');
const IsDataDescriptor = require('./IsDataDescriptor');
const isPropertyKey = require('../helpers/isPropertyKey');
const SameValue = require('./SameValue');
const ToPropertyDescriptor = require('./ToPropertyDescriptor');

// https://262.ecma-international.org/6.0/#sec-definepropertyorthrow

module.exports = function DefinePropertyOrThrow(O, P, desc) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}

	if (!isPropertyKey(P)) {
		throw new $TypeError('Assertion failed: P is not a Property Key');
	}

	const Desc = isPropertyDescriptor(desc) ? desc : ToPropertyDescriptor(desc);
	if (!isPropertyDescriptor(Desc)) {
		throw new $TypeError('Assertion failed: Desc is not a valid Property Descriptor');
	}

	return DefineOwnProperty(
		IsDataDescriptor,
		SameValue,
		FromPropertyDescriptor,
		O,
		P,
		Desc
	);
};

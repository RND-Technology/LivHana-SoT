'use strict';

const GetIntrinsic = require('get-intrinsic');
const $TypeError = require('es-errors/type');

const GetPrototypeFromConstructor = require('./GetPrototypeFromConstructor');
const IsArray = require('./IsArray');
const ObjectCreate = require('./ObjectCreate');

// https://262.ecma-international.org/6.0/#sec-ordinarycreatefromconstructor

module.exports = function OrdinaryCreateFromConstructor(constructor, intrinsicDefaultProto) {
	GetIntrinsic(intrinsicDefaultProto); // throws if not a valid intrinsic
	const proto = GetPrototypeFromConstructor(constructor, intrinsicDefaultProto);
	const slots = arguments.length < 3 ? [] : arguments[2];
	if (!IsArray(slots)) {
		throw new $TypeError('Assertion failed: if provided, `internalSlotsList` must be a List');
	}
	return ObjectCreate(proto, slots);
};

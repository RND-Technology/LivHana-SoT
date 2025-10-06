'use strict';

const GetIntrinsic = require('get-intrinsic');

const $Object = require('es-object-atoms');
const $StringPrototype = GetIntrinsic('%String.prototype%');
const $SyntaxError = require('es-errors/syntax');
const $TypeError = require('es-errors/type');
const setProto = require('set-proto');

const DefinePropertyOrThrow = require('./DefinePropertyOrThrow');

// https://262.ecma-international.org/6.0/#sec-stringcreate

module.exports = function StringCreate(value, prototype) {
	if (typeof value !== 'string') {
		throw new $TypeError('Assertion failed: `S` must be a String');
	}

	const S = $Object(value);
	if (prototype !== $StringPrototype) {
		if (setProto) {
			setProto(S, prototype);
		} else {
			throw new $SyntaxError('StringCreate: a `proto` argument that is not `String.prototype` is not supported in an environment that does not support setting the [[Prototype]]');
		}
	}

	const length = value.length;
	DefinePropertyOrThrow(S, 'length', {
		'[[Configurable]]': false,
		'[[Enumerable]]': false,
		'[[Value]]': length,
		'[[Writable]]': false
	});

	return S;
};

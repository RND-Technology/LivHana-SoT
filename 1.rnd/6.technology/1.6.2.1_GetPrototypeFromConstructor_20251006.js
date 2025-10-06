'use strict';

const GetIntrinsic = require('get-intrinsic');

const $Function = GetIntrinsic('%Function%');
const $TypeError = require('es-errors/type');
const $SyntaxError = require('es-errors/syntax');

const Get = require('./Get');
const IsConstructor = require('./IsConstructor');

const isObject = require('es-object-atoms/isObject');

// https://262.ecma-international.org/6.0/#sec-getprototypefromconstructor

module.exports = function GetPrototypeFromConstructor(constructor, intrinsicDefaultProto) {
	const intrinsic = GetIntrinsic(intrinsicDefaultProto); // throws if not a valid intrinsic
	if (!isObject(intrinsic)) {
		throw new $TypeError('intrinsicDefaultProto must be an object');
	}
	if (!IsConstructor(constructor)) {
		throw new $TypeError('Assertion failed: `constructor` must be a constructor');
	}
	let proto = Get(constructor, 'prototype');
	if (!isObject(proto)) {
		if (!(constructor instanceof $Function)) {
			// ignore other realms, for now
			throw new $SyntaxError('cross-realm constructors not currently supported');
		}
		proto = intrinsic;
	}
	return proto;
};

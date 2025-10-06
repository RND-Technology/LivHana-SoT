'use strict';

const GetIntrinsic = require('get-intrinsic');

const hasSymbols = require('has-symbols')();

const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');

const $gOPN = GetIntrinsic('%Object.getOwnPropertyNames%', true);
const $gOPS = hasSymbols && GetIntrinsic('%Object.getOwnPropertySymbols%', true);
const keys = require('object-keys');

// https://262.ecma-international.org/6.0/#sec-getownpropertykeys

module.exports = function GetOwnPropertyKeys(O, Type) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}
	if (Type === 'Symbol') {
		return $gOPS ? $gOPS(O) : [];
	}
	if (Type === 'String') {
		if (!$gOPN) {
			return keys(O);
		}
		return $gOPN(O);
	}
	throw new $TypeError('Assertion failed: `Type` must be `"String"` or `"Symbol"`');
};

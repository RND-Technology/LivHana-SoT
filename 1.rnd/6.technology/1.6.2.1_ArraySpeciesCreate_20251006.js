'use strict';

const GetIntrinsic = require('get-intrinsic');

const $Array = GetIntrinsic('%Array%');
const $species = GetIntrinsic('%Symbol.species%', true);
const $TypeError = require('es-errors/type');
const isInteger = require('math-intrinsics/isInteger');
const isObject = require('es-object-atoms/isObject');

const Get = require('./Get');
const IsArray = require('./IsArray');
const IsConstructor = require('./IsConstructor');

// https://262.ecma-international.org/6.0/#sec-arrayspeciescreate

module.exports = function ArraySpeciesCreate(originalArray, length) {
	if (!isInteger(length) || length < 0) {
		throw new $TypeError('Assertion failed: length must be an integer >= 0');
	}
	const len = length === 0 ? 0 : length;
	let C;
	const isArray = IsArray(originalArray);
	if (isArray) {
		C = Get(originalArray, 'constructor');
		// TODO: figure out how to make a cross-realm normal Array, a same-realm Array
		// if (IsConstructor(C)) {
		// 	if C is another realm's Array, C = undefined
		// 	Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(Array))) === null ?
		// }
		if ($species && isObject(C)) {
			C = Get(C, $species);
			if (C === null) {
				C = void 0;
			}
		}
	}
	if (typeof C === 'undefined') {
		return $Array(len);
	}
	if (!IsConstructor(C)) {
		throw new $TypeError('C must be a constructor');
	}
	return new C(len); // Construct(C, len);
};


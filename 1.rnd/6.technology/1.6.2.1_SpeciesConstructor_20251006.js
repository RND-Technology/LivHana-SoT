'use strict';

const GetIntrinsic = require('get-intrinsic');

const $species = GetIntrinsic('%Symbol.species%', true);
const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');

const IsConstructor = require('./IsConstructor');

// https://262.ecma-international.org/6.0/#sec-speciesconstructor

module.exports = function SpeciesConstructor(O, defaultConstructor) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}
	const C = O.constructor;
	if (typeof C === 'undefined') {
		return defaultConstructor;
	}
	if (!isObject(C)) {
		throw new $TypeError('O.constructor is not an Object');
	}
	const S = $species ? C[$species] : void 0;
	if (S == null) {
		return defaultConstructor;
	}
	if (IsConstructor(S)) {
		return S;
	}
	throw new $TypeError('no constructor found');
};

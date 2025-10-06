'use strict';

const $TypeError = require('es-errors/type');

const AdvanceStringIndex = require('es-abstract/2024/AdvanceStringIndex');
const Call = require('es-abstract/2024/Call');
const GetIteratorDirect = require('./GetIteratorDirect');
const GetMethod = require('es-abstract/2024/GetMethod');
const IsArray = require('es-abstract/2024/IsArray');
const Type = require('es-abstract/2024/Type');

const getIteratorMethod = require('es-abstract/helpers/getIteratorMethod');

// https://tc39.es/proposal-iterator-helpers/#sec-getiteratorflattenable

module.exports = function GetIteratorFlattenable(obj, stringHandling) {
	if (stringHandling !== 'REJECT-STRINGS' && stringHandling !== 'ITERATE-STRINGS') {
		throw new $TypeError('Assertion failed: `stringHandling` must be "REJECT-STRINGS" or "ITERATE-STRINGS"');
	}

	if (Type(obj) !== 'Object') {
		if (stringHandling === 'REJECT-STRINGS' || typeof obj !== 'string') {
			throw new $TypeError('obj must be an Object'); // step 1.a
		}
	}

	let method = void undefined; // step 2

	// method = GetMethod(obj, Symbol.iterator); // step 5.a
	method = getIteratorMethod(
		{
			AdvanceStringIndex: AdvanceStringIndex,
			GetMethod: GetMethod,
			IsArray: IsArray
		},
		obj
	);

	let iterator;
	if (typeof method === 'undefined') { // step 3
		iterator = obj; // step 3.a
	} else { // step 4
		iterator = Call(method, obj); // step 4.a
	}

	if (Type(iterator) !== 'Object') {
		throw new $TypeError('iterator must be an Object'); // step 5
	}
	return GetIteratorDirect(iterator); // step 6
};

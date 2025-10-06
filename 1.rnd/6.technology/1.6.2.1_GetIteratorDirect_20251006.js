'use strict';

const $TypeError = require('es-errors/type');

const Get = require('es-abstract/2024/Get');
const Type = require('es-abstract/2024/Type');

module.exports = function GetIteratorDirect(obj) {
	if (Type(obj) !== 'Object') {
		throw new $TypeError('Assertion failed: `obj` must be an Object');
	}

	const nextMethod = Get(obj, 'next'); // step 2

	const iteratorRecord = { '[[Iterator]]': obj, '[[NextMethod]]': nextMethod, '[[Done]]': false }; // step 3

	return iteratorRecord; // step 4
};

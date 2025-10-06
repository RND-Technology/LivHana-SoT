'use strict';

const $TypeError = require('es-errors/type');
const isObject = require('es-object-atoms/isObject');

const CreateNonEnumerableDataPropertyOrThrow = require('./CreateNonEnumerableDataPropertyOrThrow');
const Get = require('./Get');
const HasProperty = require('./HasProperty');

// https://262.ecma-international.org/13.0/#sec-installerrorcause

module.exports = function InstallErrorCause(O, options) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}

	if (isObject(options) && HasProperty(options, 'cause')) {
		const cause = Get(options, 'cause');
		CreateNonEnumerableDataPropertyOrThrow(O, 'cause', cause);
	}
};

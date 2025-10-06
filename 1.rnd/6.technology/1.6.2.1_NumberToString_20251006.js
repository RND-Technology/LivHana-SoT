'use strict';

const GetIntrinsic = require('get-intrinsic');

const $String = GetIntrinsic('%String%');
const $TypeError = require('es-errors/type');

// https://262.ecma-international.org/9.0/#sec-tostring-applied-to-the-number-type

module.exports = function NumberToString(m) {
	if (typeof m !== 'number') {
		throw new $TypeError('Assertion failed: "m" must be a String');
	}

	return $String(m);
};


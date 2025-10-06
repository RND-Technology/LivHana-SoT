'use strict';

const GetIntrinsic = require('get-intrinsic');

const $BigInt = GetIntrinsic('%BigInt%', true);
const $TypeError = require('es-errors/type');
const $SyntaxError = require('es-errors/syntax');

// https://262.ecma-international.org/11.0/#sec-stringtobigint

module.exports = function StringToBigInt(argument) {
	if (typeof argument !== 'string') {
		throw new $TypeError('`argument` must be a string');
	}
	if (!$BigInt) {
		throw new $SyntaxError('BigInts are not supported in this environment');
	}
	try {
		return $BigInt(argument);
	} catch (e) {
		return NaN;
	}
};

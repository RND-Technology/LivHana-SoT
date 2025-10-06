'use strict';

const GetIntrinsic = require('get-intrinsic');

const $BigInt = GetIntrinsic('%BigInt%', true);
const $RangeError = require('es-errors/range');
const $SyntaxError = require('es-errors/syntax');
const $TypeError = require('es-errors/type');
const isInteger = require('math-intrinsics/isInteger');

// https://262.ecma-international.org/11.0/#sec-numbertobigint

module.exports = function NumberToBigInt(number) {
	if (typeof number !== 'number') {
		throw new $TypeError('Assertion failed: `number` must be a String');
	}
	if (!isInteger(number)) {
		throw new $RangeError('The number ' + number + ' cannot be converted to a BigInt because it is not an integer');
	}
	if (!$BigInt) {
		throw new $SyntaxError('BigInts are not supported in this environment');
	}
	return $BigInt(number);
};

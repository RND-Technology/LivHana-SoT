'use strict';

const GetIntrinsic = require('get-intrinsic');

const $BigInt = GetIntrinsic('%BigInt%', true);
const $Number = GetIntrinsic('%Number%');
const $TypeError = require('es-errors/type');
const $SyntaxError = require('es-errors/syntax');

const StringToBigInt = require('./StringToBigInt');
const ToPrimitive = require('./ToPrimitive');

const isNaN = require('math-intrinsics/isNaN');

// https://262.ecma-international.org/11.0/#sec-tobigint

module.exports = function ToBigInt(argument) {
	if (!$BigInt) {
		throw new $SyntaxError('BigInts are not supported in this environment');
	}

	const prim = ToPrimitive(argument, $Number);

	if (prim == null) {
		throw new $TypeError('Cannot convert null or undefined to a BigInt');
	}

	if (typeof prim === 'boolean') {
		return prim ? $BigInt(1) : $BigInt(0);
	}

	if (typeof prim === 'number') {
		throw new $TypeError('Cannot convert a Number value to a BigInt');
	}

	if (typeof prim === 'string') {
		const n = StringToBigInt(prim);
		if (isNaN(n)) {
			throw new $TypeError('Failed to parse String to BigInt');
		}
		return n;
	}

	if (typeof prim === 'symbol') {
		throw new $TypeError('Cannot convert a Symbol value to a BigInt');
	}

	if (typeof prim !== 'bigint') {
		throw new $SyntaxError('Assertion failed: unknown primitive type');
	}

	return prim;
};

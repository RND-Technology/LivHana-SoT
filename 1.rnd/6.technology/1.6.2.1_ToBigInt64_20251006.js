'use strict';

const GetIntrinsic = require('get-intrinsic');

const $BigInt = GetIntrinsic('%BigInt%', true);
const $pow = require('math-intrinsics/pow');

const ToBigInt = require('./ToBigInt');
const BigIntRemainder = require('./BigInt/remainder');

const modBigInt = require('../helpers/modBigInt');

// BigInt(2**63), but node v10.4-v10.8 have a bug where you can't `BigInt(x)` anything larger than MAX_SAFE_INTEGER
const twoSixtyThree = $BigInt && (BigInt($pow(2, 32)) * BigInt($pow(2, 31)));

// BigInt(2**64), but node v10.4-v10.8 have a bug where you can't `BigInt(x)` anything larger than MAX_SAFE_INTEGER
const twoSixtyFour = $BigInt && (BigInt($pow(2, 32)) * BigInt($pow(2, 32)));

// https://262.ecma-international.org/11.0/#sec-tobigint64

module.exports = function ToBigInt64(argument) {
	const n = ToBigInt(argument);
	const int64bit = modBigInt(BigIntRemainder, n, twoSixtyFour);
	return int64bit >= twoSixtyThree ? int64bit - twoSixtyFour : int64bit;
};

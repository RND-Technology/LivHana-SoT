'use strict';

const $TypeError = require('es-errors/type');

const HasOwnProperty = require('./HasOwnProperty');
const ToNumeric = require('./ToNumeric');
const ToPrimitive = require('./ToPrimitive');
const ToString = require('./ToString');
const Type = require('./Type');

const NumberAdd = require('./Number/add');
const NumberBitwiseAND = require('./Number/bitwiseAND');
const NumberBitwiseOR = require('./Number/bitwiseOR');
const NumberBitwiseXOR = require('./Number/bitwiseXOR');
const NumberDivide = require('./Number/divide');
const NumberExponentiate = require('./Number/exponentiate');
const NumberLeftShift = require('./Number/leftShift');
const NumberMultiply = require('./Number/multiply');
const NumberRemainder = require('./Number/remainder');
const NumberSignedRightShift = require('./Number/signedRightShift');
const NumberSubtract = require('./Number/subtract');
const NumberUnsignedRightShift = require('./Number/unsignedRightShift');
const BigIntAdd = require('./BigInt/add');
const BigIntBitwiseAND = require('./BigInt/bitwiseAND');
const BigIntBitwiseOR = require('./BigInt/bitwiseOR');
const BigIntBitwiseXOR = require('./BigInt/bitwiseXOR');
const BigIntDivide = require('./BigInt/divide');
const BigIntExponentiate = require('./BigInt/exponentiate');
const BigIntLeftShift = require('./BigInt/leftShift');
const BigIntMultiply = require('./BigInt/multiply');
const BigIntRemainder = require('./BigInt/remainder');
const BigIntSignedRightShift = require('./BigInt/signedRightShift');
const BigIntSubtract = require('./BigInt/subtract');
const BigIntUnsignedRightShift = require('./BigInt/unsignedRightShift');

// https://262.ecma-international.org/12.0/#sec-applystringornumericbinaryoperator

// https://262.ecma-international.org/12.0/#step-applystringornumericbinaryoperator-operations-table
const table = {
	'**': [NumberExponentiate, BigIntExponentiate],
	'*': [NumberMultiply, BigIntMultiply],
	'/': [NumberDivide, BigIntDivide],
	'%': [NumberRemainder, BigIntRemainder],
	'+': [NumberAdd, BigIntAdd],
	'-': [NumberSubtract, BigIntSubtract],
	'<<': [NumberLeftShift, BigIntLeftShift],
	'>>': [NumberSignedRightShift, BigIntSignedRightShift],
	'>>>': [NumberUnsignedRightShift, BigIntUnsignedRightShift],
	'&': [NumberBitwiseAND, BigIntBitwiseAND],
	'^': [NumberBitwiseXOR, BigIntBitwiseXOR],
	'|': [NumberBitwiseOR, BigIntBitwiseOR]
};

module.exports = function ApplyStringOrNumericBinaryOperator(lval, opText, rval) {
	if (typeof opText !== 'string' || !HasOwnProperty(table, opText)) {
		throw new $TypeError('Assertion failed: `opText` must be a valid operation string');
	}
	if (opText === '+') {
		const lprim = ToPrimitive(lval);
		const rprim = ToPrimitive(rval);
		if (typeof lprim === 'string' || typeof rprim === 'string') {
			const lstr = ToString(lprim);
			const rstr = ToString(rprim);
			return lstr + rstr;
		}
		/* eslint no-param-reassign: 1 */
		lval = lprim;
		rval = rprim;
	}
	const lnum = ToNumeric(lval);
	const rnum = ToNumeric(rval);
	if (Type(lnum) !== Type(rnum)) {
		throw new $TypeError('types of ' + lnum + ' and ' + rnum + ' differ');
	}
	const Operation = table[opText][typeof lnum === 'bigint' ? 1 : 0];
	return Operation(lnum, rnum);
};

'use strict';

const GetIntrinsic = require('get-intrinsic');

const $Number = GetIntrinsic('%Number%');

const isPrimitive = require('../helpers/isPrimitive');

const ToPrimitive = require('./ToPrimitive');
const ToNumber = require('./ToNumber');

// https://262.ecma-international.org/11.0/#sec-tonumeric

module.exports = function ToNumeric(argument) {
	const primValue = isPrimitive(argument) ? argument : ToPrimitive(argument, $Number);
	if (typeof primValue === 'bigint') {
		return primValue;
	}
	return ToNumber(primValue);
};

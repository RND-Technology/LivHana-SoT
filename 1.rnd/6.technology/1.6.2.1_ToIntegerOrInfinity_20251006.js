'use strict';

const abs = require('./abs');
const floor = require('./floor');
const ToNumber = require('./ToNumber');

const $isNaN = require('math-intrinsics/isNaN');
const $isFinite = require('math-intrinsics/isFinite');
const $sign = require('math-intrinsics/sign');

// https://262.ecma-international.org/12.0/#sec-tointegerorinfinity

module.exports = function ToIntegerOrInfinity(value) {
	const number = ToNumber(value);
	if ($isNaN(number) || number === 0) { return 0; }
	if (!$isFinite(number)) { return number; }
	const integer = floor(abs(number));
	if (integer === 0) { return 0; }
	return $sign(number) * integer;
};

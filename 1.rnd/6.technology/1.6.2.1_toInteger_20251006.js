'use strict';

const ToNumber = require('./ToNumber');

const abs = require('math-intrinsics/abs');
const floor = require('math-intrinsics/floor');
const $isNaN = require('math-intrinsics/isNaN');
const $isFinite = require('math-intrinsics/isFinite');
const $sign = require('math-intrinsics/sign');

// http://262.ecma-international.org/5.1/#sec-9.4

module.exports = function ToInteger(value) {
	const number = ToNumber(value);
	if ($isNaN(number)) { return 0; }
	if (number === 0 || !$isFinite(number)) { return number; }
	return $sign(number) * floor(abs(number));
};

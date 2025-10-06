'use strict';

const modulo = require('./modulo');
const ToNumber = require('./ToNumber');

const abs = require('math-intrinsics/abs');
const floor = require('math-intrinsics/floor');
const $isNaN = require('math-intrinsics/isNaN');
const $isFinite = require('math-intrinsics/isFinite');
const $sign = require('math-intrinsics/sign');

// http://262.ecma-international.org/5.1/#sec-9.7

module.exports = function ToUint16(value) {
	const number = ToNumber(value);
	if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
	const posInt = $sign(number) * floor(abs(number));
	return modulo(posInt, 0x10000);
};

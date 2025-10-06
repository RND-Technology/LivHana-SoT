'use strict';

const ToNumber = require('./ToNumber');

const $isNaN = require('math-intrinsics/isNaN');
const $isFinite = require('math-intrinsics/isFinite');
const $sign = require('math-intrinsics/sign');
const abs = require('math-intrinsics/abs');
const floor = require('math-intrinsics/floor');
const modulo = require('math-intrinsics/mod');

// https://262.ecma-international.org/6.0/#sec-touint8

module.exports = function ToUint8(argument) {
	const number = ToNumber(argument);
	if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
	const posInt = $sign(number) * floor(abs(number));
	return modulo(posInt, 0x100);
};

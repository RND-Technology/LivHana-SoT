'use strict';

const $abs = require('math-intrinsics/abs');
const $floor = require('math-intrinsics/floor');
const $pow = require('math-intrinsics/pow');

const isFinite = require('math-intrinsics/isFinite');
const isNaN = require('math-intrinsics/isNaN');
const isNegativeZero = require('math-intrinsics/isNegativeZero');

const maxFiniteFloat32 = 3.4028234663852886e+38; // roughly 2 ** 128 - 1

module.exports = function valueToFloat32Bytes(value, isLittleEndian) {
	if (isNaN(value)) {
		return isLittleEndian ? [0, 0, 192, 127] : [127, 192, 0, 0]; // hardcoded
	}

	let leastSig;

	if (value === 0) {
		leastSig = isNegativeZero(value) ? 0x80 : 0;
		return isLittleEndian ? [0, 0, 0, leastSig] : [leastSig, 0, 0, 0];
	}

	if ($abs(value) > maxFiniteFloat32 || !isFinite(value)) {
		leastSig = value < 0 ? 255 : 127;
		return isLittleEndian ? [0, 0, 128, leastSig] : [leastSig, 128, 0, 0];
	}

	const sign = value < 0 ? 1 : 0;
	value = $abs(value); // eslint-disable-line no-param-reassign

	let exponent = 0;
	while (value >= 2) {
		exponent += 1;
		value /= 2; // eslint-disable-line no-param-reassign
	}

	while (value < 1) {
		exponent -= 1;
		value *= 2; // eslint-disable-line no-param-reassign
	}

	let mantissa = value - 1;
	mantissa *= $pow(2, 23) + 0.5;
	mantissa = $floor(mantissa);

	exponent += 127;
	exponent <<= 23;

	let result = (sign << 31)
        | exponent
        | mantissa;

	const byte0 = result & 255;
	result >>= 8;
	const byte1 = result & 255;
	result >>= 8;
	const byte2 = result & 255;
	result >>= 8;
	const byte3 = result & 255;

	if (isLittleEndian) {
		return [byte0, byte1, byte2, byte3];
	}
	return [byte3, byte2, byte1, byte0];
};

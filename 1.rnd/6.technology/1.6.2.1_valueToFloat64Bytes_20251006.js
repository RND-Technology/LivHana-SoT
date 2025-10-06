'use strict';

const GetIntrinsic = require('get-intrinsic');

const $parseInt = GetIntrinsic('%parseInt%');
const $abs = require('math-intrinsics/abs');
const $floor = require('math-intrinsics/floor');
const isNegativeZero = require('math-intrinsics/isNegativeZero');

const callBound = require('call-bound');

const $strIndexOf = callBound('String.prototype.indexOf');
const $strSlice = callBound('String.prototype.slice');

const fractionToBitString = require('../helpers/fractionToBinaryString');
const intToBinString = require('../helpers/intToBinaryString');

const float64bias = 1023;

const elevenOnes = '11111111111';
const elevenZeroes = '00000000000';
const fiftyOneZeroes = elevenZeroes + elevenZeroes + elevenZeroes + elevenZeroes + '0000000';

// IEEE 754-1985
module.exports = function valueToFloat64Bytes(value, isLittleEndian) {
	const signBit = value < 0 || isNegativeZero(value) ? '1' : '0';
	let exponentBits;
	let significandBits;

	if (isNaN(value)) {
		exponentBits = elevenOnes;
		significandBits = '1' + fiftyOneZeroes;
	} else if (!isFinite(value)) {
		exponentBits = elevenOnes;
		significandBits = '0' + fiftyOneZeroes;
	} else if (value === 0) {
		exponentBits = elevenZeroes;
		significandBits = '0' + fiftyOneZeroes;
	} else {
		value = $abs(value); // eslint-disable-line no-param-reassign

		// Isolate the integer part (digits before the decimal):
		const integerPart = $floor(value);

		const intBinString = intToBinString(integerPart); // bit string for integer part
		const fracBinString = fractionToBitString(value - integerPart); // bit string for fractional part

		let numberOfBits;
		// find exponent needed to normalize integer+fractional parts
		if (intBinString) {
			exponentBits = intBinString.length - 1; // move the decimal to the left
		} else {
			const first1 = $strIndexOf(fracBinString, '1');
			if (first1 > -1) {
				numberOfBits = first1 + 1;
			}
			exponentBits = -numberOfBits; // move the decimal to the right
		}

		significandBits = intBinString + fracBinString;
		if (exponentBits < 0) {
			// subnormals
			if (exponentBits <= -float64bias) {
				numberOfBits = float64bias - 1; // limit number of removed bits
			}
			significandBits = $strSlice(significandBits, numberOfBits); // remove all leading 0s and the first 1 for normal values; for subnormals, remove up to `float64bias - 1` leading bits
		} else {
			significandBits = $strSlice(significandBits, 1); // remove the leading '1' (implicit/hidden bit)
		}
		exponentBits = $strSlice(elevenZeroes + intToBinString(exponentBits + float64bias), -11); // Convert the exponent to a bit string

		significandBits = $strSlice(significandBits + fiftyOneZeroes + '0', 0, 52); // fill in any trailing zeros and ensure we have only 52 fraction bits
	}

	const bits = signBit + exponentBits + significandBits;
	const rawBytes = [];
	for (let i = 0; i < 8; i++) {
		const targetIndex = isLittleEndian ? 8 - i - 1 : i;
		rawBytes[targetIndex] = $parseInt($strSlice(bits, i * 8, (i + 1) * 8), 2);
	}

	return rawBytes;
};

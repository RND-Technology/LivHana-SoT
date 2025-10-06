'use strict';

const MAX_ITER = 1075; // 1023+52 (subnormals) => BIAS+NUM_SIGNFICAND_BITS-1
const maxBits = 54; // only 53 bits for fraction

module.exports = function fractionToBitString(x) {
	let str = '';
	if (x === 0) {
		return str;
	}
	let j = MAX_ITER;

	let y;
	// Each time we multiply by 2 and find a ones digit, add a '1'; otherwise, add a '0'..
	for (let i = 0; i < MAX_ITER; i += 1) {
		y = x * 2;
		if (y >= 1) {
			x = y - 1; // eslint-disable-line no-param-reassign
			str += '1';
			if (j === MAX_ITER) {
				j = i; // first 1
			}
		} else {
			x = y; // eslint-disable-line no-param-reassign
			str += '0';
		}
		// Stop when we have no more decimals to process or in the event we found a fraction which cannot be represented in a finite number of bits...
		if (y === 1 || i - j > maxBits) {
			return str;
		}
	}
	return str;
};

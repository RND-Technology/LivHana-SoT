'use strict';

const $TypeError = require('es-errors/type');

const ToInt32 = require('../ToInt32');
const ToUint32 = require('../ToUint32');

// https://262.ecma-international.org/11.0/#sec-numeric-types-number-leftShift

module.exports = function NumberLeftShift(x, y) {
	if (typeof x !== 'number' || typeof y !== 'number') {
		throw new $TypeError('Assertion failed: `x` and `y` arguments must be Numbers');
	}

	const lnum = ToInt32(x);
	const rnum = ToUint32(y);

	const shiftCount = rnum & 0x1F;

	return lnum << shiftCount;
};

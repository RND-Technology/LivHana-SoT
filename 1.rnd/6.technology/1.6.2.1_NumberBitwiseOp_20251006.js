'use strict';

const $TypeError = require('es-errors/type');

const ToInt32 = require('./ToInt32');
const ToUint32 = require('./ToUint32');

// https://262.ecma-international.org/11.0/#sec-numberbitwiseop

module.exports = function NumberBitwiseOp(op, x, y) {
	if (op !== '&' && op !== '|' && op !== '^') {
		throw new $TypeError('Assertion failed: `op` must be `&`, `|`, or `^`');
	}
	if (typeof x !== 'number' || typeof y !== 'number') {
		throw new $TypeError('Assertion failed: `x` and `y` arguments must be Numbers');
	}
	const lnum = ToInt32(x);
	const rnum = ToUint32(y);
	if (op === '&') {
		return lnum & rnum;
	}
	if (op === '|') {
		return lnum | rnum;
	}
	return lnum ^ rnum;
};
